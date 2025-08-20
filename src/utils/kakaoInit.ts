declare global {
  interface Window {
    Kakao: any;
  }
}

export const initKakao = () => {
  if (window.Kakao && !window.Kakao.isInitialized()) {
    // 카카오 JavaScript SDK 초기화
    window.Kakao.init('3603235ce533a9b3b7a8192bf07c5908');
    console.log('Kakao SDK 초기화 완료');
  }
};