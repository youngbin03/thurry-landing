import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src="/images/ThurryLogo.png" alt="Thurry Logo" className="h-8 w-auto" />
          <img src="/images/ThurryText.png" alt="Thurry Text" className="h-6 w-auto" />
        </div>
        <div className="flex items-center space-x-2">
          <a 
            href="http://pf.kakao.com/_XFxoVn"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border-2 border-orange-500 text-orange-500 rounded-full text-sm font-medium hover:bg-orange-50 transition-colors"
          >
            입점문의
          </a>
          <div className="relative group">
            <button className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors">
              앱다운로드
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <a 
                href="https://apps.apple.com/kr/app/%EB%96%A0%EB%A6%AC-%EB%B2%A0%EC%9D%B4%EC%BB%A4%EB%A6%AC-%EB%A7%88%EA%B0%90%ED%95%A0%EC%9D%B8/id6742439407?l=en-GB"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
              >
                iOS 다운로드
              </a>
              <a 
                href="https://play.google.com/store/games"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
              >
                Android 다운로드
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;