import React, { useState, useEffect } from 'react';

const OnboardingSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    '/images/page01.png',
    '/images/page02.png',
    '/images/page03.png',
    '/images/page04.png'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="pt-8 pb-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="relative">
          {/* Carousel Container */}
          <div className="overflow-hidden rounded-3xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div 
                  key={index}
                  className="w-full flex-shrink-0"
                >
                  <img 
                    src={slide} 
                    alt={`온보딩 이미지 ${index + 1}`}
                    className="w-full h-auto object-cover"
                    style={{ aspectRatio: '1/1' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/40 backdrop-blur-sm rounded-full p-3 hover:bg-white/60 transition-all"
            aria-label="이전 슬라이드"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/40 backdrop-blur-sm rounded-full p-3 hover:bg-white/60 transition-all"
            aria-label="다음 슬라이드"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-3 mt-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 rounded-full transition-all ${
                currentSlide === index 
                  ? 'bg-orange-500 w-12' 
                  : 'bg-gray-300 hover:bg-gray-400 w-3'
              }`}
              aria-label={`슬라이드 ${index + 1}로 이동`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OnboardingSection;