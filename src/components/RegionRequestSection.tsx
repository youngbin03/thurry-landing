import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue, increment, update } from "firebase/database";
import { app } from '../firebase';

const database = getDatabase(app);

const SEOUL_DISTRICTS = [
  '송파구', '강남구', '노원구', '강서구', '관악구', '성북구', '은평구', '서초구', 
  '동작구', '강동구', '중랑구', '마포구', '양천구', '구로구', '영등포구', '도봉구', 
  '중구', '종로구', '서대문구', '성동구', '강북구', '용산구', '동대문구', '금천구'
];

const RegionRequestSection: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [districtVotes, setDistrictVotes] = useState<Record<string, number>>({});
  const [sortedDistricts, setSortedDistricts] = useState(SEOUL_DISTRICTS);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 투표수에 따라 지역 정렬
  useEffect(() => {
    if (selectedDistrict) return; // 선택된 지역이 있으면 정렬하지 않음
    
    const sorted = [...SEOUL_DISTRICTS].sort((a, b) => 
      (districtVotes[b] || 0) - (districtVotes[a] || 0)
    );
    setSortedDistricts(sorted);
  }, [districtVotes, selectedDistrict]);

  useEffect(() => {
    // Firebase에서 투표 데이터 실시간 감시
    const votesRef = ref(database, 'seoul_votes');
    const unsubscribe = onValue(votesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setDistrictVotes(data);
    });

    return () => unsubscribe();
  }, []);

  const handleDistrictClick = async (district: string) => {
    if (selectedDistrict) return; // 이미 선택한 경우 더 이상의 선택 불가
    
    setSelectedDistrict(district);
    const updates: Record<string, any> = {};
    updates[`seoul_votes/${district}`] = increment(1);
    
    try {
      await update(ref(database), updates);
    } catch (error) {
      console.error('투표 업데이트 실패:', error);
    }
  };

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-white via-white to-gray-200">
      <div className="max-w-4xl mx-auto">
                 <h2 className="text-3xl md:text-4xl font-bold text-orange-500 mb-4">
            우리 지역도 필요해요!
          </h2>
          <p className="text-lg text-gray-600">
            떠리 서비스 지역을 확대하고 있어요.<br />
            우리 동네를 1등으로 만들어주세요!
          </p>

          {/* District Selector */}
          <div className="mb-6">
            <div 
              ref={scrollContainerRef}
              className="flex gap-1 overflow-x-auto py-4 hide-scrollbar px-1"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {sortedDistricts.map((district) => {
                const votes = districtVotes[district] || 0;
                const isSelected = selectedDistrict === district;
                return (
                  <button
                    key={district}
                    onClick={() => handleDistrictClick(district)}
                    className={`flex-none relative group ${
                      isSelected ? 'scale-110 transform transition-transform' : ''
                    }`}
                  >
                    <div className="relative w-[80px] h-[80px] group">
                      <img 
                        src={isSelected ? '/icons/bread_pick.png' : '/icons/bread.png'} 
                        alt={district}
                        className={`w-full h-full object-contain transition-transform duration-300 ${
                          isSelected ? 'scale-105' : 'group-hover:scale-102'
                        }`}
                      />
                      <div className={`
                        absolute inset-0 flex flex-col items-center justify-center
                        ${isSelected ? 'text-orange-500' : 'text-gray-600'}
                      `}>
                        <div className="text-xs font-bold">{district}</div>
                        <div className={`
                          relative px-1.5 rounded
                          ${isSelected ? 'bg-white/90 mt-0.5' : 'mt-1'}
                        `}>
                          <span className={`
                            font-bold whitespace-nowrap
                            ${isSelected ? 'text-orange-500 text-[11px]' : 'text-[10px]'}
                          `}>
                            {votes.toLocaleString()}
                            <span className={`${isSelected ? 'text-[9px]' : 'text-[8px]'}`}>명</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Total Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>전체 투표 현황</span>
              <span>{Object.values(districtVotes).reduce((a, b) => a + b, 0)}명</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-500" 
                style={{ 
                  width: `${Math.min(
                    (Object.values(districtVotes).reduce((a, b) => a + b, 0) / 10000) * 100, 
                    100
                  )}%` 
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              10,000명 달성시 서울시 전역 확대!
            </p>
          </div>
      </div>
    </section>
  );
};

export default RegionRequestSection;