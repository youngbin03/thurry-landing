import { v4 as uuidv4 } from 'uuid';

declare global {
  interface Window {
    Kakao: any;
  }
}

interface ShareResponse {
  success: boolean;
  callbackId?: string;
}

export const shareToKakao = async (): Promise<ShareResponse> => {
  if (!window.Kakao) {
    console.error('Kakao SDK가 로드되지 않았습니다.');
    return { success: false };
  }

  const callbackId = uuidv4();
  // 더 정확한 모바일 감지 (MacIntel 플랫폼은 데스크톱으로 처리)
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && 
                  !(/Macintosh|Windows|Linux|MacIntel/i.test(navigator.platform));

  console.log('플랫폼 감지:', { 
    userAgent: navigator.userAgent, 
    isMobile,
    platform: navigator.platform,
    actualDevice: isMobile ? 'mobile' : 'desktop'
  });

  // 웹훅 사용자 정의 파라미터 (Firebase Functions와 연동)
  const userId = 'user_' + Math.random().toString(36).substr(2, 9);
  const serverCallbackArgs = {
    user_id: userId,
    action: 'thurry_pass_share',
    share_type: 'preorder',
    callback_id: callbackId,
    timestamp: Date.now(),
    platform: isMobile ? 'mobile' : 'desktop'
  };

  return new Promise((resolve) => {
    try {
      if (isMobile) {
        // 모바일: 사용자 정의 템플릿 + 웹훅 파라미터
        window.Kakao.Share.sendCustom({
          templateId: 123525,
          templateArgs: {
            title: '떠리 무료 패스권 🎁',
            description: '일주일 동안 매일 무료빵 1개!\n성동구 제휴 푸드매장의 마감메뉴를 하루 1개, 무료로 픽업할 수 있는 구독형 패스입니다.',
          },
          serverCallbackArgs: serverCallbackArgs,
          success: function(response: any) {
            console.log('카카오톡 공유 성공 (모바일):', response);
            console.log('웹훅으로 전달될 사용자 ID:', userId);
            resolve({ success: true, callbackId });
          },
          fail: function(error: any) {
            console.error('카카오톡 공유 실패 (모바일):', error);
            resolve({ success: false });
          }
        });
      } else {
        // 데스크톱: 웹 기반 카카오톡 공유 다이얼로그
        try {
          // 카카오톡 공유 다이얼로그 URL 생성
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

          // 카카오톡 공유 팝업 URL
          const shareUrl = `https://sharer.kakao.com/talk/friends/picker/link` +
            `?app_key=${window.Kakao.getAppKey()}` +
            `&validation_action=default` +
            `&validation_params=${encodeURIComponent(JSON.stringify({
              link_ver: '4.0',
              template_object: templateObject,
              server_callback_args: serverCallbackArgs
            }))}`;

          console.log('카카오톡 공유 다이얼로그 URL:', shareUrl);

          // 팝업 창으로 공유 다이얼로그 열기
          const popup = window.open(
            shareUrl,
            'kakao_share_popup',
            'width=500,height=700,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,status=no'
          );

          if (popup) {
            console.log('카카오톡 공유 다이얼로그 열림 (데스크톱)');
            console.log('웹훅으로 전달될 사용자 ID:', userId);
            
            // 팝업 상태 모니터링
            let popupClosed = false;
            const checkPopup = setInterval(() => {
              if (popup.closed) {
                clearInterval(checkPopup);
                popupClosed = true;
                console.log('카카오톡 공유 다이얼로그 닫힘');
                resolve({ success: true, callbackId });
              }
            }, 1000);
            
            // 30초 후 자동 처리
            setTimeout(() => {
              if (!popupClosed) {
                clearInterval(checkPopup);
                if (!popup.closed) {
                  popup.close();
                }
                resolve({ success: true, callbackId });
              }
            }, 30000);
          } else {
            console.error('팝업이 차단되었습니다');
            alert('브라우저에서 팝업을 차단했습니다.\n팝업 허용 후 다시 시도해주세요.');
            resolve({ success: false });
          }
        } catch (error) {
          console.error('웹 기반 공유 다이얼로그 오류:', error);
          resolve({ success: false });
        }
      }
    } catch (error) {
      console.error('카카오톡 공유 오류:', error);
      resolve({ success: false });
    }
  });
};

// 웹훅 응답 확인 함수 - Firebase Functions와 연동
export const waitForWebhookCallback = async (callbackId: string, timeout: number = 60000): Promise<boolean> => {
  console.log('웹훅 대기 시작 (Firebase Functions 연동):', callbackId);
  console.log('📱 카카오톡에서 친구나 채팅방에 메시지를 전송해주세요!');
  
  const webhookStatusUrl = `https://us-central1-thurry-a244e.cloudfunctions.net/kakaoShareWebhook/status/${callbackId}`;
  
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = Math.floor(timeout / 3000); // 3초마다 체크
    
    const checkInterval = setInterval(async () => {
      attempts++;
      console.log(`📤 카카오톡 공유 완료 대기 중... (${attempts}/${maxAttempts})`);
      console.log('💡 카카오톡에서 메시지 전송을 완료해주세요!');
      
      try {
        // Firebase Functions에서 웹훅 상태 확인
        const response = await fetch(webhookStatusUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ 웹훅 확인됨! 공유 완료:', data);
          
          // 공유 성공 확인
          if (data.shared === true) {
            // 템플릿 ID 확인 (선택사항)
            if (data.templateId && data.templateId.toString() === '123525') {
              console.log('✅ 올바른 템플릿 ID로 공유 완료:', data.templateId);
            } else if (data.templateId) {
              console.log('⚠️ 다른 템플릿 ID로 공유됨:', data.templateId, '(예상: 123525)');
            } else {
              console.log('ℹ️ 템플릿 ID 없음 (기본 메시지 템플릿 사용)');
            }
            
            console.log('📊 웹훅 상세 정보:', {
              chatType: data.chatType,
              method: data.method,
              resourceId: data.resourceId,
              isValidTemplate: data.isValidTemplate
            });
            
            clearInterval(checkInterval);
            resolve(true);
            return;
          } else {
            console.log('⚠️ 웹훅은 수신되었지만 공유 상태가 false:', data);
          }
        } else if (response.status === 404) {
          // 아직 웹훅이 도착하지 않음
          console.log(`⏳ 웹훅 대기 중... (${attempts}/${maxAttempts})`);
        } else {
          console.error('웹훅 상태 확인 오류:', response.status, response.statusText);
        }
        
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.log('⚠️ 웹훅 타임아웃 - 카카오톡 공유가 완료되지 않았습니다');
          console.log('💡 해결방법: 카카오톡에서 친구/채팅방을 선택하고 메시지를 실제로 전송해주세요');
          console.log('🔍 웹훅 URL 확인 필요:', webhookStatusUrl);
          resolve(false);
          return;
        }
        
      } catch (error) {
        console.error('웹훅 상태 확인 오류:', error);
        console.log('🌐 네트워크 오류 또는 CORS 문제일 수 있습니다');
        
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.log('⚠️ 웹훅 확인 실패 - 네트워크 오류');
          resolve(false);
        }
      }
    }, 3000); // 3초마다 확인
    
    // 타임아웃 설정
    setTimeout(() => {
      clearInterval(checkInterval);
      console.log('⏰ 웹훅 대기 시간 초과 (' + (timeout/1000) + '초)');
      console.log('🔍 확인사항:');
      console.log('  1. 카카오 디벨로퍼스 웹훅 URL:', 'https://us-central1-thurry-a244e.cloudfunctions.net/kakaoShareWebhook');
      console.log('  2. 템플릿 ID:', '123525');
      console.log('  3. Firebase Functions 배포 상태');
      console.log('  4. 실제 메시지 전송 완료 여부');
      resolve(false);
    }, timeout);
  });
};