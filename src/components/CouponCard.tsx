import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

interface CouponCardProps {
  passId: string;
  startDate: Date;
  endDate: Date;
  userInfo?: {
    gender: string;
    age: string;
    registeredAt: string;
  };
}

const CouponCard: React.FC<CouponCardProps> = ({ passId, startDate, endDate, userInfo }) => {
  const couponRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSaveImage = async () => {
    if (!couponRef.current || isSaving) return;

    setIsSaving(true);
    
    try {
      const element = couponRef.current;
      
      console.log('🖼️ 쿠폰 이미지 저장 시작');
      
      // 1. 모든 애니메이션과 transform 일시 정지
      const elementsToRestore: { element: HTMLElement; originalStyle: any }[] = [];
      
      const disableAnimationsAndTransforms = (el: HTMLElement) => {
        elementsToRestore.push({
          element: el,
          originalStyle: {
            animation: el.style.animation,
            transform: el.style.transform,
            transition: el.style.transition
          }
        });
        
        el.style.animation = 'none';
        el.style.transform = 'none';
        el.style.transition = 'none';
        
        // 자식 요소들도 재귀적으로 처리
        Array.from(el.children).forEach(child => {
          if (child instanceof HTMLElement) {
            disableAnimationsAndTransforms(child);
          }
        });
      };
      
      disableAnimationsAndTransforms(element);
      
      // 2. 이미지 로딩 대기
      const images = element.querySelectorAll('img');
      const imagePromises = Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve(img);
          } else {
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img); // 오류가 있어도 계속 진행
            // 타임아웃 설정 (5초)
            setTimeout(() => resolve(img), 5000);
          }
        });
      });
      
      console.log(`📸 ${images.length}개 이미지 로딩 대기 중...`);
      await Promise.all(imagePromises);
      
      // 3. 레이아웃 안정화 대기
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('🎨 html2canvas 실행 중...');
      
      // 4. 캔버스 생성
      const canvas = await html2canvas(element, {
        scale: 2, // 고해상도
        backgroundColor: '#ffffff', // 흰색 배경
        logging: true, // 디버깅용 로그 활성화
        useCORS: true,
        allowTaint: true, // 외부 이미지 허용
        foreignObjectRendering: false, // 안정성을 위해 비활성화
        imageTimeout: 10000, // 이미지 로딩 타임아웃 10초
        removeContainer: true,
        width: element.offsetWidth,
        height: element.offsetHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc, clonedElement) => {
          // 클론된 문서에서 추가 스타일 정리
          const allElements = clonedElement.querySelectorAll('*');
          allElements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.animation = 'none';
              el.style.transform = 'none';
              el.style.transition = 'none';
            }
          });

          // 헤더 텍스트들을 살짝 위쪽으로 이동시켜 위치 보정
          const headerContainer = clonedElement.querySelector('.flex.items-center.justify-between.mb-4');
          if (headerContainer instanceof HTMLElement) {
            // "떠리 패스" 텍스트 위치 보정 (더 많이 위로)
            const titleText = headerContainer.querySelector('h3');
            if (titleText instanceof HTMLElement) {
              titleText.style.transform = 'translateY(-6px)'; // 4px 위로 이동 (기존 2px에서 증가)
              titleText.style.lineHeight = '1.2';
              titleText.style.margin = '0';
              titleText.style.padding = '0';
            }
            
            // 오른쪽 코드 텍스트 위치 보정 (더 많이 위로)
            const codeContainer = headerContainer.querySelector('.px-3.py-1.rounded-full.text-sm.font-medium');
            if (codeContainer instanceof HTMLElement) {
              const codeText = codeContainer.querySelector('span');
              if (codeText instanceof HTMLElement) {
                codeText.style.transform = 'translateY(-6px)'; // 3px 위로 이동 (기존 1px에서 증가)
                codeText.style.lineHeight = '1';
                codeText.style.margin = '0';
                codeText.style.padding = '0';
              }
            }
          }
        }
      });

      console.log('✅ 캔버스 생성 완료:', canvas.width, 'x', canvas.height);

      // 5. 스타일 복원
      elementsToRestore.forEach(({ element: el, originalStyle }) => {
        el.style.animation = originalStyle.animation || '';
        el.style.transform = originalStyle.transform || '';
        el.style.transition = originalStyle.transition || '';
      });

      // 6. 캔버스 검증
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('캔버스 크기가 0입니다.');
      }

      // 7. 이미지 다운로드
      const dataURL = canvas.toDataURL('image/png', 1.0);
      
      // 빈 이미지 검증 (매우 작은 파일 크기 체크)
      if (dataURL.length < 1000) {
        throw new Error('생성된 이미지가 비어있습니다.');
      }

      const link = document.createElement('a');
      link.download = `thurry-pass-${passId.slice(-8)}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('💾 이미지 저장 완료');
      alert('쿠폰 이미지가 저장되었습니다! 📱');
      
    } catch (error) {
      console.error('❌ 이미지 저장 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      alert(`쿠폰 이미지 저장에 실패했습니다.\n오류: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <div 
        ref={couponRef}
        className="w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-xl relative bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-500"
        style={{
          background: 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #eab308 100%)'
        }}
      >
        {/* 티켓 상단 */}
        <div className="p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-lg mr-2">
                <img 
                  src="/images/ThurryLogo.png" 
                  alt="Thurry" 
                  className="w-6 h-6 block"
                  crossOrigin="anonymous"
                />
              </div>
              <h3 className="text-xl font-bold">베이커리 할인권</h3>
            </div>
            <div 
              className="px-3 py-1 rounded-full text-sm font-medium" 
              style={{ background: 'rgba(255, 255, 255, 0.2)' }}
            >
              <span className="font-medium tracking-wider text-white">
                #{passId.slice(-8)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🎁</span>
              <span className="text-lg font-bold">베이커리 50% 할인</span>
            </div>
            <div className="text-sm opacity-80">
              성동구 제휴 베이커리에서 50% 할인을 받을 수 있는 특별 쿠폰입니다. (계정당 1개만 사용가능해요)
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-sm">
              <span className="w-20 opacity-80">시작일</span>
              <span className="font-medium">{formatDate(startDate)}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="w-20 opacity-80">종료일</span>
              <span className="font-medium">{formatDate(endDate)}</span>
            </div>
          </div>
        </div>

        {/* 티켓 하단 */}
        <div className="p-6 border-t border-white/20">
          <div className="flex justify-between items-center">
            <div className="text-white text-sm">
              <span className="opacity-80">발급일</span>
              <div className="font-medium">
                {new Date().toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>
        </div>

        {/* 장식용 빵 아이콘들 */}
        <div 
          className="absolute opacity-[0.07] pointer-events-none select-none"
          style={{ 
            right: '-80px', 
            top: '-80px', 
            transform: 'rotate(12deg)',
            fontSize: '180px',
            lineHeight: '1'
          }}
        >
          🥨
        </div>
        <div 
          className="absolute opacity-[0.07] pointer-events-none select-none"
          style={{ 
            left: '-80px', 
            bottom: '-80px', 
            transform: 'rotate(-12deg)',
            fontSize: '180px',
            lineHeight: '1'
          }}
        >
          🥖
        </div>
      </div>

      {/* 이미지 저장 버튼 */}
      <button
        onClick={handleSaveImage}
        disabled={isSaving}
        className={`mt-6 px-6 py-3 rounded-xl font-medium shadow-lg transition-colors flex items-center gap-2 ${
          isSaving 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-white text-gray-800 hover:bg-gray-50'
        }`}
      >
        {isSaving ? (
          <>
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            이미지 생성 중...
          </>
        ) : (
          <>
            <span className="text-l">💾</span>
            쿠폰 이미지로 저장하기
          </>
        )}
      </button>
    </div>
  );
};

export default CouponCard;