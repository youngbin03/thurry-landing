import React from 'react';

interface ChatTypeErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatTypeErrorDialog: React.FC<ChatTypeErrorDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-auto overflow-hidden animate-[slideUp_0.3s_ease-out]">
        <div className="p-6 text-center">
          <div className="mb-4">
            <img 
              src="/images/donut_sorry.png" 
              alt="죄송해요" 
              className="w-24 h-24 mx-auto mb-4"
            />
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            앗! 잠깐만요 🙋‍♀️
          </h3>
          
          <div className="space-y-3 mb-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              베이커리 50% 할인권은<br />
              <span className="font-semibold text-orange-500">여럿이 함께 있는 채팅방</span>에<br />
              공유해주셔야 받을 수 있어요!
            </p>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs text-orange-700">
                💡 <span className="font-medium">팁:</span> 친구들과의 단체 채팅방이나<br />
                가족 채팅방에 공유해보세요!
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full bg-orange-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-orange-600 transition-colors"
          >
            알겠어요!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTypeErrorDialog;
