import React from 'react';

interface ShareFailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

const ShareFailDialog: React.FC<ShareFailDialogProps> = ({ isOpen, onClose, onRetry }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
        {/* 캐릭터 이미지 */}
        <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-6 text-center">
          <img 
            src="/images/donut_sorry.png" 
            alt="Sorry Donut" 
            className="w-24 h-24 mx-auto mb-4"
          />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            아쉬워요!
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            카카오 공유를 확인하지 못했어요<br />
            다시 시도해주세요
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="p-4 space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-[#FEE500] hover:bg-[#FDD800] text-black font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <img src="/icons/kakao_logo.svg" alt="Kakao" className="w-4 h-4" />
            다시 공유하기
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors"
          >
            닫기
          </button>
        </div>

        {/* 도움말 */}
        <div className="px-4 pb-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs text-orange-700 leading-relaxed">
              💡 <strong>공유 완료 방법:</strong><br />
              1. 카카오톡에서 친구/채팅방 선택<br />
              2. "전송" 버튼으로 메시지 전송<br />
              3. 전송 완료 후 앱으로 돌아오기
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareFailDialog;
