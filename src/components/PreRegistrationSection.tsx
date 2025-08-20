import React, { useState, useEffect } from 'react';
import { shareToKakao, waitForWebhookCallback } from '../utils/kakaoShare';
import CouponCard from './CouponCard';
import ShareFailDialog from './ShareFailDialog';

const PreRegistrationSection: React.FC = () => {
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    // 8월 1일부터 현재까지의 20분 단위 계산
    const startDate = new Date('2025-08-20T00:00:00');
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60));
    const intervals = Math.floor(diffMinutes / 20);
    const baseCount = 1234; // 기본 참여자 수
    const currentCount = baseCount + intervals;
    
    setParticipantCount(currentCount);

    // 20분마다 카운트 증가
    const timer = setInterval(() => {
      setParticipantCount(prev => prev + 1);
    }, 20 * 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  const [showCoupon, setShowCoupon] = useState(false);
  const [couponData, setCouponData] = useState<{
    passId: string;
    startDate: Date;
    endDate: Date;
    userInfo?: {
      gender: string;
      age: string;
      registeredAt: string;
    };
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [showFailDialog, setShowFailDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    gender?: boolean;
    age?: boolean;
  }>({});

  const handleShare = async () => {
    try {
      // 유효성 검사
      const errors: { gender?: boolean; age?: boolean } = {};
      
      if (!gender) {
        errors.gender = true;
      }
      if (!age) {
        errors.age = true;
      }
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
      
      // 유효성 검사 통과 시 에러 상태 초기화
      setValidationErrors({});
      
      setIsLoading(true);
      console.log('카카오톡 공유 시작...');
      
      // 데스크톱 환경에서 팝업 차단 경고
      const isDesktop = !(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
      if (isDesktop) {
        console.log('데스크톱 환경 감지: 팝업 허용이 필요할 수 있습니다.');
      }
      
      const shareResult = await shareToKakao();
      
      if (!shareResult.success) {
        if (isDesktop) {
          // 데스크톱에서는 팝업 차단 안내를 위한 별도 처리
          alert('❌ 카카오톡 공유 다이얼로그를 열 수 없습니다!\n\n해결 방법:\n1. 브라우저 주소창 오른쪽의 팝업 차단 아이콘 클릭\n2. "팝업 및 리디렉션 허용" 선택\n3. 페이지 새로고침 후 다시 시도');
        } else {
          setShowFailDialog(true);
        }
        return;
      }
      
      console.log('카카오톡 공유 API 호출 성공, 웹훅 대기 중...');
      
      // 웹훅 콜백 대기 (Firebase Functions에서 자동 패스권 생성)
      if (shareResult.callbackId) {
        console.log('실제 카카오톡 공유 완료 확인 중...');
        const actuallyShared = await waitForWebhookCallback(shareResult.callbackId, 60000);
        
        if (!actuallyShared) {
          setShowFailDialog(true);
          return;
        }
        
        console.log('Firebase Functions에서 패스권 생성 완료! 쿠폰 표시 중...');
        
        // Firebase Functions에서 자동으로 패스권을 생성했으므로 
        // 여기서는 UI용 쿠폰 데이터만 생성
        const now = new Date();
        const startDate = new Date(2024, 8, 1); // 9월 1일
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7); // 일주일 후
        
        // 현재 날짜가 9월 1일 이후라면 오늘부터 시작
        if (now >= startDate) {
          startDate.setTime(now.getTime());
          endDate.setTime(now.getTime() + (7 * 24 * 60 * 60 * 1000));
        }
        
        setCouponData({
          passId: 'THURRY_' + Math.random().toString(36).substr(2, 8).toUpperCase(),
          startDate: startDate,
          endDate: endDate,
          userInfo: {
            gender: gender,
            age: age,
            registeredAt: new Date().toISOString()
          }
        });
        setShowCoupon(true);
        
        // 성공 알림
        alert('🎉 떠리 패스권이 발급되었습니다!\n매일 무료빵 1개씩 받아가세요!');
        
      } else {
        // callbackId가 없는 경우
        console.log('웹훅 미지원 환경');
        alert('카카오톡 공유를 완료해주세요.\n공유가 완료되면 자동으로 패스권이 발급됩니다.');
      }
    } catch (error) {
      console.error('처리 중 오류:', error);
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryShare = () => {
    setShowFailDialog(false);
    handleShare();
  };

  const handleCloseFailDialog = () => {
    setShowFailDialog(false);
  };

  return (
    <section className="py-12 px-4 bg-gradient-to-br from-orange-50/80 via-orange-50/50 to-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          지금 성동구에 있으신가요?
        </h2>
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-3">
            <p className="text-lg text-gray-600">
              가장 먼저 떠리를 만나보세요!<br />
              지금 공유하면 <span className="text-orange-500 font-bold">떠리 패스권*</span>을 드려요!
            </p>
            <p className="text-sm text-gray-500">*떠리 패스: 데일리 무료빵 픽업쿠폰</p>
          </div>
          <img src="/images/scon_free.png" alt="무료 패스권" className="w-32 h-auto" />
        </div>

        {/* Form */}
        <div className="max-w-md mb-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                {validationErrors.gender && (
                  <div className="absolute -top-8 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg z-10">
                    <div className="relative">
                      입력해주세요
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
                    </div>
                  </div>
                )}
                <select 
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value);
                    if (e.target.value && validationErrors.gender) {
                      setValidationErrors(prev => ({ ...prev, gender: false }));
                    }
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white text-gray-700 appearance-none transition-colors ${
                    validationErrors.gender 
                      ? 'border-red-500 border-2' 
                      : gender 
                        ? 'border-[#f97316]' 
                        : 'border-gray-200'
                  }`}
                >
                  <option value="">성별 선택</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>
              
              <div className="flex-1 relative">
                {validationErrors.age && (
                  <div className="absolute -top-8 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg z-10">
                    <div className="relative">
                      입력해주세요
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
                    </div>
                  </div>
                )}
                <select 
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    if (e.target.value && validationErrors.age) {
                      setValidationErrors(prev => ({ ...prev, age: false }));
                    }
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white text-gray-700 appearance-none transition-colors ${
                    validationErrors.age 
                      ? 'border-red-500 border-2' 
                      : age 
                        ? 'border-[#f97316]' 
                        : 'border-gray-200'
                  }`}
                >
                  <option value="">연령대 선택</option>
                  <option value="20">20대</option>
                  <option value="30">30대</option>
                  <option value="40">40대</option>
                  <option value="50">50대 이상</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Share Button */}
        <div className="max-w-md">
          <button 
            id="kakao-share-button"
            onClick={handleShare}
            disabled={isLoading}
            className={`w-full px-6 py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
              isLoading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-[#FEE500] text-[#000000] hover:bg-[#FDD800]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                패스권 발급 중...
              </>
            ) : (
              <>
                <img src="/icons/kakao_logo.svg" alt="Kakao" className="w-5 h-5" />
                카카오톡으로 공유하고 쿠폰받기
              </>
            )}
          </button>
        </div>

        {/* Badge */}
        <div className="mt-5 flex justify-center">
          <div className="bg-white rounded-full py-2 px-5 border-2 border-[#f97316] inline-flex items-center gap-2">
            <span className="text-sm text-gray-500">현재까지</span>
            <div className="relative overflow-hidden h-6">
              <span 
                className="font-bold text-orange-500 inline-block animate-[slideUp_0.5s_ease-out_0.2s_forwards]"
              >
                {participantCount.toLocaleString()}
                <span className="text-sm ml-0.5">명</span>
              </span>
            </div>
            <span className="text-sm text-gray-500">참여</span>
          </div>
        </div>

        {/* 쿠폰 모달 */}
        {showCoupon && couponData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="relative">
              <CouponCard {...couponData} />
              <button
                onClick={() => setShowCoupon(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-200"
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {/* 공유 실패 다이얼로그 */}
        <ShareFailDialog 
          isOpen={showFailDialog}
          onClose={handleCloseFailDialog}
          onRetry={handleRetryShare}
        />
      </div>
    </section>
  );
};

export default PreRegistrationSection;