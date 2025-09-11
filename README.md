# 흥덕청소년 문화의집 시설 이용 예약 시스템

## 개요
흥덕청소년 문화의집의 시설 이용 예약을 관리하는 웹 애플리케이션입니다. 
Firebase Realtime Database를 사용하여 실시간 데이터 동기화와 안정적인 데이터 저장을 제공합니다.
모바일, 태블릿, 데스크톱 모든 디바이스에서 최적화된 사용자 경험을 제공합니다.

## 🚀 주요 기능
- ✅ 시설 예약 생성 및 관리
- ✅ 예약 현황 실시간 조회 및 시간대별 비활성화 표시
- ✅ 예약 취소(상태 변경) 및 취소된 예약 구분 표시
- ✅ 시설별 상세 정보 제공
- ✅ Firebase Realtime Database 연동
- ✅ 실시간 데이터 동기화
- ✅ 반응형 웹 디자인
- ✅ 관리자 모드에서 예약 강제 취소 및 전체 예약 관리

## 🛠️ 기술 스택

### 백엔드
- **Node.js**: 서버 런타임
- **Express.js**: 웹 프레임워크
- **Firebase Realtime Database**: 실시간 데이터베이스
- **Firebase SDK**: Firebase 서비스 연동
- **CORS**: 크로스 오리진 요청 처리

### 프론트엔드
- **HTML5**: 시맨틱 마크업
- **CSS3**: 모던 스타일링 및 애니메이션
- **JavaScript (ES6+)**: 동적 인터페이스 및 API 통신
- **Firebase Web SDK**: 클라이언트 사이드 Firebase 연동

### 개발 도구
- **Nodemon**: 개발 시 자동 재시작
- **Body-parser**: 요청 데이터 파싱

## 📦 설치 및 실행

### 필수 요구사항
- Node.js (v18 이상)
- npm 또는 yarn
- Firebase 프로젝트 설정

### 1. 프로젝트 클론
```bash
git clone [repository-url]
cd firebasedb
```

### 2. 의존성 설치
```bash
npm install
```

### 3. Firebase 설정
Firebase 프로젝트에서 다음 서비스를 활성화하세요:
- **Realtime Database**: 실시간 데이터 저장
- **Authentication**: 사용자 인증 (선택사항)
- **Analytics**: 사용자 분석 (선택사항)

### 4. 데이터베이스 초기화
```bash
# Firebase Realtime Database 초기화
npm run init-realtime
```

### 5. 서버 실행
```bash
# 개발 모드 (nodemon 사용)
npm run dev

# 프로덕션 모드
npm start
```

### 6. 접속
브라우저에서 `http://localhost:3000`으로 접속

## 🔥 Firebase 설정

### Firebase 프로젝트 설정
1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Realtime Database 활성화
3. 보안 규칙 설정 (개발용):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 환경 변수 설정
프로덕션 환경에서는 다음 환경 변수를 설정하세요:
```bash
NODE_ENV=production
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.region.firebasedatabase.app/
```

## 🏗️ 프로젝트 구조

```
firebasedb/
├── app.js                    # Express 서버 메인 파일
├── firebase-config.js        # Firebase 설정 (백엔드)
├── realtime-database.js      # Firebase Realtime Database 모듈
├── firebase-database.js      # Firestore 모듈 (대안)
├── init-realtime-db.js       # Realtime Database 초기화
├── package.json              # 프로젝트 의존성 및 스크립트
├── routes/
│   └── reservations.js       # 예약 관련 API 라우트
├── public/                   # 프론트엔드 파일들
│   ├── firebase-config.js    # Firebase 설정 (프론트엔드)
│   ├── index.html            # 메인 페이지
│   ├── rental.html           # 시설 이용 페이지
│   ├── select-facility.html  # 시설 선택 페이지
│   ├── reservation-date.html # 날짜 및 시간 선택 페이지 (예약 시간대 비활성화 UI)
│   ├── reservation-complete.html # 예약 완료 페이지
│   ├── cancel-reservation.html # 예약 취소 페이지 (취소된 예약 구분)
│   ├── status.html           # 예약 현황 페이지 (관리자/일반)
│   ├── admin.html            # 관리자 페이지
│   ├── styles.css            # 스타일시트
│   └── script.js             # 공통 JavaScript
└── README.md                 # 프로젝트 문서
```

## 📊 데이터베이스 구조

### Firebase Realtime Database 구조
```json
{
  "reservations": {
    "reservation_id_1": {
      "name": "홍길동",
      "phone": "010-1234-5678",
      "facility": "닌텐도",
      "detail": "닌텐도1",
      "date": "2024-01-15",
      "start_time": "14:00",
      "end_time": "16:00",
      "purpose": "게임",
      "status": "active", // 예약 상태 (active/cancelled)
      "created_at": "2024-01-15T14:00:00Z"
    }
  },
  "facilities": {
    "facility_id_1": {
      "name": "플레이스테이션",
      "description": "게임 및 엔터테인먼트 공간",
      "max_capacity": 4,
      "hourly_rate": 5000
    }
  }
}
```

## 🔌 API 문서

### 예약 관련 API

#### 1. 모든 예약 조회
```http
GET /api/reservations
```

#### 2. 특정 날짜 예약 조회
```http
GET /api/reservations/date/:date
```

#### 3. 새 예약 생성
```http
POST /api/reservations
Content-Type: application/json

{
  "name": "홍길동",
  "phone": "010-1234-5678",
  "facility": "닌텐도",
  "detail": "닌텐도1",
  "date": "2024-01-15",
  "start_time": "14:00",
  "end_time": "16:00",
  "purpose": "게임"
}
```

#### 4. 예약 취소 (상태 변경)
```http
PATCH /api/reservations/:id/cancel
```
- 예약이 취소되면 status가 'cancelled'로 변경되고, 예약 시간대는 다시 예약 가능해집니다.
- **이미 취소된 예약을 다시 취소하려고 하면 서버는 400(Bad Request)와 함께 '이미 취소된 예약입니다.'라는 메시지를 반환합니다.**
- **프론트엔드에서는 취소된 예약에는 '취소' 버튼이 보이지 않으며, 사용자는 두 번 취소를 시도할 수 없습니다.**
- 만약 네트워크 문제 등으로 취소 후 목록이 즉시 갱신되지 않으면, 같은 예약에 대해 또 취소를 시도할 수 있으나, 이 경우 서버에서 400 에러와 안내 메시지를 반환합니다.

#### 5. 예약 삭제 (관리자)
```http
DELETE /api/reservations/:id
```

## 🖥️ UI/UX 특징
- 예약된 시간대는 회색/취소선/예약됨 표시로 명확하게 비활성화
- 취소된 예약은 '취소됨'으로 표시되고, 취소 버튼이 숨겨짐
- 관리자 모드에서는 모든 예약(취소 포함) 관리 가능
- 반응형 디자인, 모바일 최적화

## 📝 기타
- 실시간 데이터 동기화 및 상태 반영
- 코드/디자인/UX 개선 요청은 언제든 환영합니다!

## 📞 지원 및 문의

프로젝트 관련 문의사항이나 버그 리포트는 이슈 트래커를 통해 제출해 주세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**흥덕청소년 문화의집** - 청소년들의 문화 활동을 위한 최고의 공간 🏛️

PGHOST=your-supabase-host.supabase.co
PGUSER=your-db-username
PGPASSWORD=your-db-password
PGDATABASE=your-db-name 

const db = require('./database/database');
db.pool.connect()
  .then(() => console.log('PostgreSQL 연결 성공!'))
  .catch(err => {
    console.error('PostgreSQL 연결 실패:', err.message);
    process.exit(1);
  }); 

## ☁️ Cloudtype + GitHub 자동 배포 안내

### 자동 배포 동작 방식
- Cloudtype에 GitHub 저장소가 연동되어 있다면, main/master 브랜치에 코드를 push할 때마다 자동으로 배포가 진행됩니다.
- Cloudtype의 '자동 배포' 옵션이 켜져 있어야 하며, 배포 이력 및 로그에서 자동 반영 여부를 확인할 수 있습니다.

### 자동 배포 설정 방법
1. Cloudtype 대시보드에서 프로젝트 생성 시 GitHub 저장소를 연동합니다.
2. '자동 배포' 옵션을 활성화합니다.
3. main/master 브랜치에 push하면 자동으로 최신 코드가 배포됩니다.

### 수동 배포가 필요한 경우
- 자동 배포가 꺼져 있거나, 브랜치 설정이 다를 경우에는 Cloudtype 대시보드에서 직접 '배포' 버튼을 눌러야 변경사항이 반영됩니다.

### 참고
- Cloudtype 대시보드의 '배포 이력' 또는 '로그'에서 배포 상태를 확인할 수 있습니다.
- 자동 배포가 정상 동작하지 않을 경우, Cloudtype의 '자동 배포' 설정을 다시 확인하세요. 

## ✨ 주요 UI/UX 개선점

- **앱처럼 한 화면에 주요 정보가 보이도록 레이아웃과 여백을 최적화**
- **여백 최소화, 탭과 안내 카드가 한 화면에 딱 붙게, 불필요한 공백 완전 제거**
- **모든 주요 섹션(이용현황, 시설 안내, QR 안내 등) 간의 공백까지 완전히 제거하여 한 페이지처럼 자연스럽게 연결**
- **상단 이미지, 헤더, 본문(카드)의 가로폭을 모두 통일하여 일관된 레이아웃 제공**
- **안내 카드(시설 안내/QR 안내) 높이 균등하게 맞춤**
- **이용신청/예약취소/이용현황 탭 버튼의 가로 길이 증가로 터치 및 가독성 향상**
- **태블릿 세로에서는 안내 카드가 세로로, 가로/PC에서는 2열로, 모바일에서는 세로로 자연스럽게 배치되어 기기 방향에 따라 UX가 최적화됨**
- **기기별(PC/태블릿/모바일) 레이아웃 최적화 및 한 페이지 UX 실현**

## 📱 반응형 디자인 상세

- 태블릿/PC/모바일에서 한 페이지 UX 실현
- 모든 주요 섹션(탭, 안내 카드 등) 간의 간격까지 완전히 붙게 최적화
- 상단 이미지, 헤더, 본문(카드)의 가로폭을 모두 통일하여 깔끔한 한 페이지 UX 제공
- 태블릿 최적화 (768px - 1024px): 레이아웃 안정성, 한 페이지 표시, 터치 최적화, 가독성 향상
- 모바일 최적화 (768px 이하): 단일 컬럼, 터치 친화적, 빠른 로딩
- 데스크톱 지원 (1024px 이상): 다중 컬럼, 마우스 인터랙션, 고해상도 지원
- 안내 카드(시설 안내/QR 안내) 높이 균등, 탭 버튼 가로 길이 증가 등 최신 UX 반영

.facility-qr-row, .container, main {
    gap: 0 !important;
}
.facility-qr-row > *,
.tab-section > * {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
}

window.cancelReservation = cancelReservation;

function getTimeBtnsHTML() {
    const slots = selectedAMPM==='AM' ? amSlots : pmSlots;
    const reserved = Object.keys(reservationData).length > 0 ? 
        getReservedTimes(facilityName, selectedFacility, selectedDate) : [];
    console.log('reserved:', reserved);
    let html = '';
    slots.forEach(time => {
        const paddedTime = time.padStart(5, '0');
        const reservedPadded = reserved.map(t => t.padStart(5, '0'));
        const isReserved = reservedPadded.includes(paddedTime);
        console.log('버튼 시간:', time, 'reserved:', reserved, 'padded:', paddedTime, 'isReserved:', isReserved);
        let isPastTime = false;
        if (selectedDate === formatDateToYYYYMMDD(today)) {
            const [hour, minute] = time.split(':').map(Number);
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
                isPastTime = true;
            }
        }
        const isDisabled = isReserved || isPastTime;
        const disabledText = isReserved ? ' (예약됨)' : '';
        let buttonClass = 'time-btn';
        if (isDisabled) buttonClass += ' disabled';
        if (selectedTime === time) buttonClass += ' selected';
        let buttonHtml = `<button class="${buttonClass}" data-time="${time}"`;
        if (isDisabled) buttonHtml += ' disabled';
        buttonHtml += `>${time}${disabledText}</button>`;
        html += buttonHtml;
    });
    return html;
}
