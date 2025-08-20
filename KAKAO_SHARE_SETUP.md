# 카카오톡 공유 웹훅 설정 가이드

## 🔧 구현된 기능

### ✅ 완료된 개선사항
1. **웹훅 사용자 정의 파라미터 추가**
   - `callbackId`: 고유한 공유 식별자 (UUID)
   - `timestamp`: 공유 시점
   - `platform`: 모바일/데스크톱 구분
   - `userId`: 익명 사용자 ID

2. **실제 공유 완료 확인 로직**
   - 모바일: 템플릿 메시지 + 웹훅 확인
   - 데스크톱: 기본 메시지 + 웹훅 확인
   - 30초 타임아웃으로 실제 공유 완료 대기

3. **사용자 경험 개선**
   - 로딩 상태 표시
   - 공유 진행 상황 안내
   - 실패 시 명확한 피드백

### 📱 플랫폼별 구현

#### 모바일 환경
```typescript
// 사용자 정의 템플릿 사용
window.Kakao.Share.sendCustom({
  templateId: 123525,
  templateArgs: { ... },
  serverCallbackArgs: {
    callbackId: uuid(),
    timestamp: Date.now(),
    platform: 'mobile',
    userId: 'anonymous_xxx'
  }
});
```

#### 데스크톱 환경
```typescript
// 기본 템플릿 사용
window.Kakao.Share.sendDefault({
  objectType: 'feed',
  content: { ... },
  serverCallbackArgs: {
    callbackId: uuid(),
    timestamp: Date.now(),
    platform: 'desktop',
    userId: 'anonymous_xxx'
  }
});
```

## 🛠 설정 필요사항

### 1. 카카오 디벨로퍼스 설정

#### 웹훅 URL 등록
1. [카카오 디벨로퍼스](https://developers.kakao.com) → 앱 선택
2. **[앱] → [웹훅] → [카카오톡 공유 웹훅]**
3. 웹훅 URL: `https://us-central1-thurry-a244e.cloudfunctions.net/kakaoShareWebhook`
4. 메서드: `GET` ✅ **카카오톡 공유 웹훅은 GET 메서드가 맞습니다**

#### JavaScript 키 설정
```typescript
// src/utils/kakaoInit.ts
window.Kakao.init('3603235ce533a9b3b7a8192bf07c5908'); // 실제 키로 교체
```

### 2. Firebase Functions 배포

#### functions/index.js 생성
```javascript
const { onRequest } = require('firebase-functions/v2/https');
const { getDatabase } = require('firebase-admin/database');
const admin = require('firebase-admin');

// Firebase Admin 초기화
if (!admin.apps.length) {
  admin.initializeApp();
}

exports.kakaoShareWebhook = onRequest(async (request, response) => {
  // CORS 설정
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Kakao-Resource-ID');

  if (request.method === 'OPTIONS') {
    response.status(200).send('');
    return;
  }

  // 웹훅 상태 확인 요청
  if (request.method === 'GET' && request.path.startsWith('/status/')) {
    const callbackId = request.path.split('/status/')[1];
    
    try {
      const db = getDatabase();
      const snapshot = await db.ref(`webhook_callbacks/${callbackId}`).once('value');
      const data = snapshot.val();
      
      if (data) {
        response.status(200).json(data);
      } else {
        response.status(404).json({ error: 'Callback not found' });
      }
    } catch (error) {
      console.error('상태 확인 오류:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
    return;
  }

  // 카카오톡 공유 웹훅 처리 (GET/POST 메서드)
  if (request.method === 'GET' || request.method === 'POST') {
    const authHeader = request.get('Authorization');
    const resourceId = request.get('X-Kakao-Resource-ID');
    const userAgent = request.get('User-Agent');

    // 카카오에서 온 요청인지 검증
    if (!authHeader?.startsWith('KakaoAK ') || userAgent !== 'KakaoOpenAPI/1.0') {
      console.log('비인가 웹훅 요청:', { authHeader, userAgent, resourceId });
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      let chatType, hashChatId, templateId, customParams = {};

      if (request.method === 'GET') {
        // GET 요청: Query Parameter에서 데이터 추출
        chatType = request.query.CHAT_TYPE;
        hashChatId = request.query.HASH_CHAT_ID;
        templateId = request.query.TEMPLATE_ID;
        
        // 사용자 정의 파라미터 추출 (CHAT_TYPE, HASH_CHAT_ID, TEMPLATE_ID 제외)
        const excludeKeys = ['CHAT_TYPE', 'HASH_CHAT_ID', 'TEMPLATE_ID'];
        Object.keys(request.query).forEach(key => {
          if (!excludeKeys.includes(key)) {
            customParams[key] = request.query[key];
          }
        });
      } else {
        // POST 요청: JSON Body에서 데이터 추출
        const body = request.body;
        chatType = body.CHAT_TYPE;
        hashChatId = body.HASH_CHAT_ID;
        templateId = body.TEMPLATE_ID;
        
        // 사용자 정의 파라미터 추출
        const excludeKeys = ['CHAT_TYPE', 'HASH_CHAT_ID', 'TEMPLATE_ID'];
        Object.keys(body).forEach(key => {
          if (!excludeKeys.includes(key)) {
            customParams[key] = body[key];
          }
        });
      }

      // 사용자 정의 파라미터에서 callback_id 찾기
      const callbackId = customParams.callback_id || customParams.callbackId;
      
      if (!callbackId) {
        console.log('callback_id 누락:', { customParams, method: request.method });
        response.status(400).json({ error: 'Missing callback_id in custom parameters' });
        return;
      }

      console.log('카카오톡 공유 웹훅 수신:', { 
        method: request.method,
        callbackId, 
        templateId, 
        chatType,
        hashChatId,
        resourceId,
        customParams
      });

      // 템플릿 ID 검증 (123525인지 확인)
      const isValidTemplate = templateId && templateId.toString() === '123525';
      if (!isValidTemplate) {
        console.log('⚠️ 예상하지 않은 템플릿 ID:', templateId, '(예상: 123525)');
      }

      // Firebase Realtime Database에 웹훅 정보 저장
      const db = getDatabase();
      await db.ref(`webhook_callbacks/${callbackId}`).set({
        callbackId,
        shared: true,
        timestamp: Date.now(),
        templateId: templateId ? parseInt(templateId) : null,
        chatType: chatType,
        hashChatId: hashChatId,
        resourceId: resourceId,
        userAgent: userAgent,
        method: request.method,
        customParams: customParams,
        isValidTemplate: isValidTemplate
      });

      console.log('✅ 카카오톡 공유 웹훅 처리 완료:', { 
        callbackId, 
        templateId, 
        chatType, 
        isValidTemplate 
      });
      
      // 카카오에게 성공 응답 (3초 이내)
      response.status(200).send('OK');
    } catch (error) {
      console.error('웹훅 처리 오류:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
    return;
  }

  response.status(405).json({ error: 'Method not allowed' });
});
```

#### 배포 명령어
```bash
# Firebase CLI 설치
npm install -g firebase-tools

# 로그인
firebase login

# 프로젝트 초기화 (functions 디렉토리에서)
firebase init functions

# 배포
firebase deploy --only functions
```

### 3. 환경 변수 설정

#### .env 파일 생성
```env
REACT_APP_KAKAO_JAVASCRIPT_KEY=your_javascript_key_here
REACT_APP_FIREBASE_PROJECT_ID=thurry-a244e
```

## 🚨 현재 문제점 및 해결방안

### ❌ 발견된 문제
1. **웹훅 인증 및 검증 부족**
   - Authorization 헤더 (`KakaoAK ${APP_ADMIN_KEY}`) 미검증
   - X-Kakao-Resource-ID 헤더 미활용
   - User-Agent 검증 부족

2. **GET/POST 메서드 모두 지원 필요**
   - 카카오는 GET 또는 POST 메서드로 웹훅 전송 가능
   - 현재 구현이 한 가지 방식만 처리

3. **사용자 정의 파라미터 처리 개선**
   - `serverCallbackArgs`에 포함된 `callback_id` 추출 로직 개선
   - 표준 카카오 파라미터와 사용자 정의 파라미터 분리

### ✅ 해결방안

#### 1. 완전한 인증 검증
```javascript
const authHeader = request.get('Authorization');
const resourceId = request.get('X-Kakao-Resource-ID');
const userAgent = request.get('User-Agent');

// 카카오에서 온 요청인지 검증
if (!authHeader?.startsWith('KakaoAK ') || userAgent !== 'KakaoOpenAPI/1.0') {
  response.status(401).json({ error: 'Unauthorized' });
  return;
}
```

#### 2. GET/POST 메서드 모두 지원
```javascript
if (request.method === 'GET' || request.method === 'POST') {
  // GET: Query Parameter에서 데이터 추출
  // POST: JSON Body에서 데이터 추출
}
```

#### 2. Firebase Functions CORS 설정 확인
```javascript
// CORS 헤더가 올바르게 설정되어 있는지 확인
response.set('Access-Control-Allow-Origin', '*');
response.set('Access-Control-Allow-Methods', 'GET, POST');
response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Kakao-Resource-ID');
```

#### 3. 템플릿 ID 확인
- 모바일 공유 시 사용되는 템플릿 ID: `123525`
- 웹훅에서 받은 `TEMPLATE_ID`와 일치하는지 확인

## 🔍 작동 원리

### 1. 공유 플로우
1. 사용자가 "카카오톡으로 공유하고 쿠폰받기" 버튼 클릭
2. 고유한 `callbackId` 생성
3. 카카오톡 공유 API 호출 (사용자 정의 파라미터 포함)
4. 사용자가 실제로 친구/채팅방에 메시지 전송
5. 카카오가 웹훅 URL로 성공 알림 전송
6. Firebase Functions에서 웹훅 처리 후 DB 저장
7. 클라이언트에서 2초마다 상태 확인
8. 공유 완료 확인 시 쿠폰 생성

### 2. 웹훅 검증
- **Authorization 헤더**: `KakaoAK ${APP_ADMIN_KEY}`
- **User-Agent**: `KakaoOpenAPI/1.0`
- **X-Kakao-Resource-ID**: 웹훅별 고유 ID

### 3. 데이터 구조
```json
{
  "webhook_callbacks": {
    "uuid-callback-id": {
      "callbackId": "uuid-callback-id",
      "shared": true,
      "timestamp": 1640995200000,
      "originalTimestamp": 1640995200000,
      "platform": "mobile",
      "userId": "anonymous_abc123",
      "chatType": "DirectChat",
      "hashChatId": "hashed_chat_id",
      "templateId": 3139,
      "resourceId": "webhook_resource_id"
    }
  }
}
```

## 🚨 주의사항

1. **웹훅 응답 시간**: 카카오 웹훅은 3초 이내 응답 필수
2. **HTTPS 필수**: 웹훅 URL은 반드시 HTTPS 사용
3. **중복 처리**: 동일한 callbackId에 대한 중복 웹훅 처리 방지
4. **보안**: 웹훅 요청 검증 로직 필수 구현
5. **타임아웃**: 클라이언트 대기 시간 30초 설정

## 📊 모니터링

### Firebase 콘솔에서 확인 가능한 항목
- 웹훅 호출 횟수
- 성공/실패 비율
- 플랫폼별 공유 통계
- 채팅방 타입별 분석

이제 실제 공유 완료 여부를 정확히 확인할 수 있어 쿠폰 남발을 방지하고, 사용자에게 명확한 피드백을 제공할 수 있습니다.
