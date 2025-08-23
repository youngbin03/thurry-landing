import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="pt-16 flex flex-col items-center justify-start bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600">
      <div className="max-w-[480px] w-full mx-auto px-4 pt-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            매일 무료빵 1개
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white mb-4">
            마감할인 떠리
          </h3>
          <p className="text-xl md:text-2xl text-white/90 font-light">
            근처 빵집에서 바로 픽업하세요!
          </p>
        </div>

        {/* Screenshot */}
        <div className="relative max-w-3xl mx-auto">
          <div className="w-[70%] mx-auto border-4 border-b-0 border-gray-50 rounded-t-3xl">
            <img 
              src="/images/screenshot03.png" 
              alt="Thurry App Screenshot" 
              className="w-full h-auto rounded-t-3xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;