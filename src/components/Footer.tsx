import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 pb-24 px-4">
      <div className="max-w-[480px] mx-auto">
        <div className="flex flex-col">
          {/* 로고 */}
          <div className="bg-white rounded-xl p-2 shadow-sm mb-8 self-start">
            <img src="/images/ThurryLogo2.png" alt="Thurry Logo" className="h-12" />
          </div>

          {/* 회사 정보 */}
          <div className="text-gray-400 text-sm space-y-1.5 mb-4">
            <p>상호: (주)떠리 | 대표: 김성은·신영빈</p>
            <p>사업자 등록번호: 218-13-19643</p>
            <p>주소: 서울특별시 성동구 왕십리로 22</p>
            <p>고객센터 문의: thurry.official@gmail.com</p>
          </div>

          {/* Links */}
          <div className="flex gap-6 mb-4">
            <a 
              href="https://www.notion.so/4b1902342c684401a60222a3a3577c5c" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              이용약관
            </a>
            <span className="text-gray-600">|</span>
            <a 
              href="https://www.notion.so/1a57ed29c92f802686eaf4550684f385" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              개인정보처리방침
            </a>
          </div>
          {/* Copyright */}
          <p className="text-gray-500 text-xs mb-8 flex items-center">
            © 2025 thurry Inc.
          </p>

        </div>
      </div>
    </footer>
  );
};

export default Footer;