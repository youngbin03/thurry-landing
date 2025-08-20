import React, { useRef } from 'react';
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSaveImage = async () => {
    if (!couponRef.current) return;

    try {
      // 이미지 저장 전 레이아웃 강제 안정화
      const element = couponRef.current;
      
      // 모든 애니메이션 일시 정지
      const originalAnimation = element.style.animation;
      element.style.animation = 'none';
      
      // 약간의 지연으로 레이아웃 안정화
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: true,
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.offsetWidth,
        windowHeight: element.offsetHeight,
      });

      // 애니메이션 복원
      element.style.animation = originalAnimation;

      const link = document.createElement('a');
      link.download = `thurry-pass-${passId.slice(-8)}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      alert('쿠폰 이미지가 저장되었습니다!');
    } catch (error) {
      console.error('이미지 저장 실패:', error);
      alert('쿠폰 이미지 저장에 실패했습니다.');
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <div 
        ref={couponRef}
        className="w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-xl relative bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-500 animate-gradient-x"
      >
        {/* 티켓 상단 */}
                <div className="p-6 text-white">
          <div className="flex items-center justify-between mb-4" style={{ 
            transform: 'translate3d(0, 0, 0)',
            position: 'relative',
            top: '0px',
            left: '0px'
          }}>
            <div className="flex items-center" style={{ 
              transform: 'translate3d(0, 0, 0)',
              position: 'relative',
              top: '0px',
              left: '0px'
            }}>
              <div className="bg-white p-2 rounded-lg mr-2" style={{ 
                transform: 'translate3d(0, 0, 0)',
                position: 'relative',
                top: '0px',
                left: '0px'
              }}>
                <img 
                  src="/images/ThurryLogo.png" 
                  alt="Thurry" 
                  className="w-6 h-6" 
                  style={{ 
                    transform: 'translate3d(0, 0, 0)',
                    position: 'relative',
                    display: 'block',
                    maxWidth: '100%',
                    height: 'auto',
                    top: '0px',
                    left: '0px'
                  }} 
                />
              </div>
              <h3 className="text-xl font-bold" style={{ 
                transform: 'translate3d(0, 0, 0)',
                position: 'relative',
                display: 'block',
                top: '0px',
                left: '0px'
              }}>떠리 패스</h3>
            </div>
            <div 
              className="px-3 py-1 rounded-full text-sm font-medium" 
              style={{ 
                background: 'rgba(255, 255, 255, 0.2)',
                transform: 'translate3d(0, 0, 0)',
                position: 'relative',
                display: 'block',
                top: '0px',
                left: '0px'
              }}
            >
              <span 
                className="font-medium tracking-wider text-white"
                style={{ 
                  transform: 'translate3d(0, 0, 0)',
                  position: 'relative',
                  display: 'block',
                  top: '0px',
                  left: '0px'
                }}
              >#{passId.slice(-8)}</span>
            </div>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🎁</span>
              <span className="text-lg font-bold">데일리 무료빵 1개</span>
            </div>
            <div className="text-sm opacity-80">
              매일 1개의 무료빵을 받을 수 있는 특별 패스입니다.
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
            {userInfo && (
              <div className="flex items-center text-sm mt-2 pt-2 border-t border-white/20">
                <span className="w-20 opacity-80">등록자</span>
                <span className="font-medium">
                  {userInfo.gender === 'male' ? '남성' : '여성'} {userInfo.age}대
                </span>
              </div>
            )}
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
        <div className="absolute -right-20 -top-20 opacity-[0.07] rotate-12">
          <span className="text-[180px]">🥨</span>
        </div>
        <div className="absolute -left-20 -bottom-20 opacity-[0.07] -rotate-12">
          <span className="text-[180px]">🥖</span>
        </div>
      </div>

      {/* 이미지 저장 버튼 */}
      <button
        onClick={handleSaveImage}
        className="mt-6 px-6 py-3 bg-white rounded-xl text-gray-800 font-medium shadow-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <span className="text-l">💾</span>
        쿠폰 이미지로 저장하기
      </button>
    </div>
  );
};

export default CouponCard;