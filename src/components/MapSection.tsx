import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    naver: any;
    navermap_authFailure: () => void;
  }
}

const MapSection: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = () => {
      if (mapRef.current && window.naver) {
        const location = new window.naver.maps.LatLng(37.557772, 127.046917);
        const mapOptions = {
          center: location,
          zoom: 17,
          zoomControl: false,
          mapTypeControl: false
        };
        const map = new window.naver.maps.Map(mapRef.current, mapOptions);

        // 마커 추가
        // 정보 카드 생성
        const contentString = [
          '<div class="bg-white rounded-lg overflow-hidden shadow-lg" style="width: 160px;">',
          '  <div style="height: 140px; overflow: hidden; position: relative;">',
          '    <img src="/images/food.jpg" alt="아보카도 샌드위치" style="width: 100%; height: 140px; object-fit: cover; object-position: center 40%;" />',
          '  </div>',
          '  <div class="p-2.5" style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;">',
          '    <div style="padding-left: 1px;">',
          '      <h4 style="font-size: 13px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">떠리 베이커리</h4>',
          '      <div style="margin-bottom: 4px;">',
          '        <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 3px;">',
          '          <span style="font-size: 13px;">🎁</span>',
          '          <p style="font-size: 12px; color: #f97316; font-weight: 600;">오늘의 무료빵</p>',
          '        </div>',
          '        <div style="background: #f3f4f6; padding: 6px; border-radius: 6px; text-align: center;">',
          '          <p style="font-size: 14px; color: #333; font-weight: 700; line-height: 1.2;">아보카도 샌드위치</p>',
          '        </div>',
          '      </div>',
          '    </div>',
          '    <div style="padding: 0 2px 4px 4px;">',
          '      <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: #666; margin-bottom: 2px;">',
          '        <span>📦</span>',
          '        <span>남은수량: 5개</span>',
          '      </div>',
          '      <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: #666;">',
          '        <span>⏰</span>',
          '        <span>픽업시간: 오후 6-8시</span>',
          '      </div>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('');

        const infowindow = new window.naver.maps.InfoWindow({
          content: contentString,
          maxWidth: 160,
          backgroundColor: "transparent",
          borderColor: "transparent",
          anchorSize: new window.naver.maps.Size(0, 0),
          pixelOffset: new window.naver.maps.Point(0, -10)
        });

        // 마커 추가
        const marker = new window.naver.maps.Marker({
          position: location,
          map: map,
          icon: {
            content: '<div style="width: 36px; height: 36px; background: white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;"><img src="/images/ThurryLogo.png" style="width: 24px; height: 24px; object-fit: contain;" /></div>',
            anchor: new window.naver.maps.Point(18, 18)
          }
        });

        infowindow.open(map, marker);
      }
    };

    // 인증 실패 핸들러 추가
    window.navermap_authFailure = function() {
      console.error('Naver Map Authentication Failed');
    };

    const initScript = document.createElement('script');
    initScript.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=j5tphzmzzd`;
    initScript.async = true;
    initScript.onload = initMap;
    document.head.appendChild(initScript);

    return () => {
      document.head.removeChild(initScript);
    };
  }, []);
  return (
    <section className="pt-2 pb-12 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="max-w-lg pl-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            내 주변 빵집,<br />
            지도로 한눈에!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            오늘 등록된 무료빵과 마감할인 빵을<br />실시간으로 확인하고 바로 픽업하세요!
          </p>
        </div>

        {/* Map Mockup */}
        <div className="relative bg-gray-50 rounded-2xl overflow-hidden mx-auto max-w-sm border border-gray-100 mb-4">
          {/* Phone Frame */}
          <div className="relative">
            {/* Map Background */}
            <div className="h-[calc(100vh-220px)] relative">
              <div ref={mapRef} className="w-full h-full absolute inset-0" />



              {/* Bottom Navigation */}
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100">
                <div className="flex justify-around py-3">
                  <button className="flex flex-col items-center gap-1.5">
                    <img src="/icons/shop.svg" alt="매장" className="w-6 h-6 text-orange-500" style={{ filter: 'invert(60%) sepia(19%) saturate(2313%) hue-rotate(338deg) brightness(100%) contrast(103%)' }} />
                    <span className="text-xs font-medium text-orange-500">매장</span>
                  </button>
                  <button className="flex flex-col items-center gap-1.5">
                    <img src="/icons/receipt.svg" alt="예약" className="w-6 h-6" />
                    <span className="text-xs font-medium text-gray-400">예약</span>
                  </button>
                  <button className="flex flex-col items-center gap-1.5">
                    <img src="/icons/profile.svg" alt="프로필" className="w-6 h-6" />
                    <span className="text-xs font-medium text-gray-400">프로필</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default MapSection;