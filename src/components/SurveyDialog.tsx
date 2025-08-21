import React, { useState } from 'react';
import { getDatabase, ref, push, serverTimestamp } from 'firebase/database';
import { app } from '../firebase';

interface SurveyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FoodOption {
  id: string;
  title: string;
  image: string;
  category: string;
}

const foodOptions: FoodOption[] = [
  {
    id: 'salad_sandwich',
    title: '샐러드/샌드위치',
    image: '/images/IMG01.webp',
    category: 'healthy'
  },
  {
    id: 'bakery',
    title: '베이커리',
    image: '/images/IMG02.webp',
    category: 'bakery'
  },
  {
    id: 'sushi',
    title: '초밥',
    image: '/images/IMG03.webp',
    category: 'japanese'
  },
  {
    id: 'dosirak',
    title: '도시락/간편식',
    image: '/images/IMG04.webp',
    category: 'convenience'
  }
];

const SurveyDialog: React.FC<SurveyDialogProps> = ({ isOpen, onClose }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showThanks, setShowThanks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionSelect = async (optionId: string) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSelectedOption(optionId);
    
    try {
      // Firebase에 응답 저장
      const db = getDatabase(app);
      const surveysRef = ref(db, 'food_preference_surveys');
      await push(surveysRef, {
        selectedOption: optionId,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      });

      // 감사 메시지 표시
      setShowThanks(true);
      
      // 3초 후 다이얼로그 닫기
      setTimeout(() => {
        onClose();
        // 상태 초기화 (다음 번 열릴 때를 위해)
        setTimeout(() => {
          setShowThanks(false);
          setSelectedOption(null);
          setIsSubmitting(false);
        }, 300);
      }, 3000);
    } catch (error) {
      console.error('설문 응답 저장 실패:', error);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-auto overflow-hidden animate-[slideUp_0.3s_ease-out]">
        {!showThanks ? (
          <>
            {/* 설문 내용 */}
            <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
              <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
                마감 할인시간에 어떤 음식을<br />무료로 받고 싶으신가요?
              </h2>
              <p className="text-gray-600 text-sm text-center">
                여러분의 소중한 의견을 들려주세요 🎁
              </p>
            </div>

            {/* 옵션 그리드 */}
            <div className="grid grid-cols-2 gap-4 p-6">
              {foodOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={isSubmitting}
                  className={`relative group rounded-xl overflow-hidden transition-transform hover:scale-[1.02] ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="aspect-[4/3] relative">
                    <img
                      src={option.image}
                      alt={option.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-lg drop-shadow-lg">
                        {option.title}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          // 감사 메시지
          <div className="max-w-[240px] mx-auto p-6 text-center bg-white rounded-2xl">
            <img
              src="/images/bread_love.png"
              alt="감사합니다"
              className="w-20 h-20 mx-auto mb-3 animate-[bounceIn_0.5s_ease-out]"
            />
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              참여해 주셔서 감사해요!
            </h3>
            <p className="text-sm text-gray-600">
              더 나은 서비스를 위해<br />소중한 의견으로 활용할게요 💝
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyDialog;
