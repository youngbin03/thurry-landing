import { v4 as uuidv4 } from 'uuid';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { app } from '../firebase';

interface ShareResponse {
  success: boolean;
  callbackId?: string;
}

interface KakaoShareResult {
  success: boolean;
  passId?: string;
  error?: string;
}

export class KakaoShareService {
  private static readonly WEBHOOK_CHECK_INTERVAL = 3000; // 3초마다 체크
  private static readonly WEBHOOK_TIMEOUT = 60000; // 60초 타임아웃

  /**
   * 카카오톡 공유하기 실행
   */
  static async shareThurryPassPreorder(): Promise<ShareResponse> {
    if (!window.Kakao) {
      console.error('Kakao SDK가 로드되지 않았습니다.');
      return { success: false };
    }

    const callbackId = uuidv4();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && 
                    !(/Macintosh|Windows|Linux|MacIntel/i.test(navigator.platform));

    // 웹훅 사용자 정의 파라미터
    const serverCallbackArgs = {
      callback_id: callbackId,
      timestamp: Date.now(),
      platform: isMobile ? 'mobile' : 'desktop',
      share_type: 'preorder'
    };

    try {
      if (isMobile) {
        // 모바일: 사용자 정의 템플릿
        await window.Kakao.Share.sendCustom({
          templateId: 123525,
          templateArgs: {
            title: '떠리 무료 패스권 🎁',
            description: '일주일 동안 매일 무료빵 1개!\n성동구 제휴 푸드매장의 마감메뉴를 하루 1개, 무료로 픽업할 수 있는 구독형 패스입니다.',
          },
          serverCallbackArgs,
        });
      } else {
        // 데스크톱: 웹 기반 공유 다이얼로그
        const templateObject = {
          object_type: 'feed',
          content: {
            title: '떠리 무료 패스권 🎁',
            description: '일주일 동안 매일 무료빵 1개!\n성동구 제휴 푸드매장의 마감메뉴를 하루 1개, 무료로 픽업할 수 있는 구독형 패스입니다.',
            image_url: 'https://thurry.com/images/page03.png',
            link: {
              web_url: 'https://thurry.com',
              mobile_web_url: 'https://thurry.com'
            }
          },
          buttons: [{
            title: '무료 패스권 얻기',
            link: {
              web_url: 'https://thurry.com',
              mobile_web_url: 'https://thurry.com'
            }
          }]
        };

        const shareUrl = `https://sharer.kakao.com/talk/friends/picker/link` +
          `?app_key=${window.Kakao.getAppKey()}` +
          `&validation_action=default` +
          `&validation_params=${encodeURIComponent(JSON.stringify({
            link_ver: '4.0',
            template_object: templateObject,
            server_callback_args: serverCallbackArgs
          }))}`;

        const popup = window.open(
          shareUrl,
          'kakao_share_popup',
          'width=500,height=700,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,status=no'
        );

        if (!popup) {
          throw new Error('팝업이 차단되었습니다.');
        }
      }

      return { success: true, callbackId };
    } catch (error) {
      console.error('카카오톡 공유 오류:', error);
      return { success: false };
    }
  }

  /**
   * 웹훅 콜백 대기 및 패스권 확인
   */
  static async waitForShareCompletion(callbackId: string): Promise<KakaoShareResult> {
    return new Promise((resolve) => {
      const db = getDatabase(app);
      const webhookRef = ref(db, `webhook_callbacks/${callbackId}`);
      let timeoutId: NodeJS.Timeout;
      let checkCount = 0;
      const maxChecks = Math.floor(this.WEBHOOK_TIMEOUT / this.WEBHOOK_CHECK_INTERVAL);

      // Firebase Realtime Database 리스너 설정
      const unsubscribe = onValue(webhookRef, async (snapshot) => {
        const data = snapshot.val();
        console.log('웹훅 데이터 확인:', data);

        if (data?.shared === true) {
          // 웹훅 수신 확인됨
          clearTimeout(timeoutId);
          off(webhookRef); // 리스너 제거

          if (data.isValidTemplate) {
            resolve({
              success: true,
              passId: data.passId
            });
          } else {
            resolve({
              success: false,
              error: '올바르지 않은 템플릿으로 공유되었습니다.'
            });
          }
        } else {
          checkCount++;
          console.log(`웹훅 대기 중... (${checkCount}/${maxChecks})`);
          
          if (checkCount >= maxChecks) {
            // 타임아웃
            off(webhookRef);
            resolve({
              success: false,
              error: '카카오톡 공유 완료를 확인하지 못했습니다.'
            });
          }
        }
      });

      // 타임아웃 설정
      timeoutId = setTimeout(() => {
        off(webhookRef);
        resolve({
          success: false,
          error: '시간 초과'
        });
      }, this.WEBHOOK_TIMEOUT);
    });
  }

  /**
   * 공유하고 패스권 받기 (전체 플로우)
   */
  static async shareAndGetPass(): Promise<KakaoShareResult> {
    try {
      // 1. 카카오톡 공유 실행
      const shareResponse = await this.shareThurryPassPreorder();
      if (!shareResponse.success || !shareResponse.callbackId) {
        return {
          success: false,
          error: '카카오톡 공유를 시작할 수 없습니다.'
        };
      }

      // 2. 웹훅 수신 대기 (최대 60초)
      console.log('카카오톡 공유 웹훅 대기 시작...');
      const result = await this.waitForShareCompletion(shareResponse.callbackId);

      // 3. 결과 반환
      return result;

    } catch (error) {
      console.error('공유 처리 중 오류:', error);
      return {
        success: false,
        error: '처리 중 오류가 발생했습니다.'
      };
    }
  }
}
