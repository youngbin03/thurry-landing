import React, { useEffect } from 'react';
import Header from './components/Header';
import { initKakao } from './utils/kakaoInit';
import HeroSection from './components/HeroSection';
import OnboardingSection from './components/OnboardingSection';
import MapSection from './components/MapSection';
import PreRegistrationSection from './components/PreRegistrationSection';
import RegionRequestSection from './components/RegionRequestSection';
import Footer from './components/Footer';

function App() {
  useEffect(() => {
    // Smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    // Initialize Kakao SDK
    initKakao();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <OnboardingSection />
      <MapSection />
      <PreRegistrationSection />
      <RegionRequestSection />
      <Footer />
      
      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-xl mx-auto">
          <button 
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-xl text-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => window.open('https://apps.apple.com/kr/app/%EB%96%A0%EB%A6%AC-%EB%B2%A0%EC%9D%B4%EC%BB%A4%EB%A6%AC-%EB%A7%88%EA%B0%90%ED%95%A0%EC%9D%B8/id6742439407?l=en-GB', '_blank')}
          >
            지금 가입하면 일주일 떠리 패스가 무료!
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;