import { v4 as uuidv4 } from 'uuid';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { app } from '../firebase';

// 카카오 SDK 타입 정의
declare global {
  interface Window {
    Kakao: any;
  }
}

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
  private static readonly WEBHOOK_TIMEOUT = 30000; // 30초 타임아웃
  private static readonly APP_KEY = '3603235ce533a9b3b7a8192bf07c5908';

  /**
   * 카카오톡 공유하기 실행
   */
  private static async initializeKakao(): Promise<boolean> {
    console.log('🔍 카카오 SDK 초기화 시작');
    console.log('현재 도메인:', window.location.origin);
    console.log('앱 키:', this.APP_KEY);
    
    // SDK 로딩 대기 (최대 5초)
    let retryCount = 0;
    const maxRetries = 10;
    
    while (!window.Kakao && retryCount < maxRetries) {
      console.log(`⏳ 카카오 SDK 로딩 대기 중... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 500));
      retryCount++;
    }
    
    if (!window.Kakao) {
      console.error('❌ Kakao SDK 로딩 실패 - 스크립트가 로드되지 않았습니다.');
      console.error('💡 해결 방법: 페이지를 새로고침하거나 네트워크 연결을 확인해주세요.');
      return false;
    }

    console.log('✅ Kakao SDK 로드 완료');

    if (!window.Kakao.isInitialized()) {
      try {
        window.Kakao.init(this.APP_KEY);
        console.log('✅ Kakao SDK 초기화 완료');
      } catch (error) {
        console.error('❌ Kakao SDK 초기화 실패:', error);
        return false;
      }
    } else {
      console.log('✅ Kakao SDK 이미 초기화됨');
    }

    return true;
  }
  static async shareThurryPassPreorder(): Promise<ShareResponse> {
    const isInitialized = await this.initializeKakao();
    if (!isInitialized) {
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
          serverCallbackArgs
        });
        console.log('✅ 모바일 카카오톡 공유 다이얼로그 열림');
      } else {
        // 데스크톱: 웹 공유 다이얼로그 (카카오톡 앱 다운로드 방지)
        await window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: '떠리 무료 패스권 🎁',
            description: '일주일 동안 매일 무료빵 1개!\n성동구 제휴 푸드매장의 마감메뉴를 하루 1개, 무료로 픽업할 수 있는 구독형 패스입니다.',
            imageUrl: 'https://thurry.com/images/page03.png',
            link: {
              mobileWebUrl: 'https://thurry.com',
              webUrl: 'https://thurry.com'
            }
          },
          buttons: [{
            title: '무료 패스권 얻기',
            link: {
              mobileWebUrl: 'https://thurry.com',
              webUrl: 'https://thurry.com'
            }
          }],
          serverCallbackArgs: JSON.stringify(serverCallbackArgs),
          // 웹에서 카카오톡 앱 설치 유도 방지
          installTalk: false,
          // 웹 공유 다이얼로그 강제 사용  
          throughTalk: false
        });
        console.log('✅ 데스크톱 카카오톡 공유 다이얼로그 열림');
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
      onValue(webhookRef, async (snapshot) => {
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
      console.log('🚀 카카오톡 공유 및 패스권 발급 프로세스 시작');
      
      // 1. 카카오톡 공유 다이얼로그 열기
      const shareResponse = await this.shareThurryPassPreorder();
      
      if (!shareResponse.success || !shareResponse.callbackId) {
        console.error('❌ 카카오톡 공유 다이얼로그 열기 실패');
        return {
          success: false,
          error: '카카오톡 공유를 시작할 수 없습니다.'
        };
      }

      console.log('✅ 카카오톡 공유 다이얼로그 열림 성공');
      console.log('⏳ 사용자의 공유 완료를 기다리는 중...');

      // 2. 웹훅 수신 대기 (최대 60초)
      const result = await this.waitForShareCompletion(shareResponse.callbackId);

      if (result.success) {
        console.log('🎉 패스권 발급 완료!', result.passId);
      } else {
        console.log('⚠️ 공유 미완료 또는 시간 초과:', result.error);
      }

      // 3. 결과 반환
      return result;

    } catch (error) {
      console.error('❌ 공유 처리 중 오류:', error);
      return {
        success: false,
        error: '처리 중 오류가 발생했습니다.'
      };
    }
  }
}
