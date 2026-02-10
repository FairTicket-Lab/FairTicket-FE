# FairTicket Frontend 🎫

공정한 콘서트 티켓 예매 시스템 - 프론트엔드

## 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| **Framework** | Vue | 3.5+ |
| **Language** | TypeScript | 5.9+ |
| **Build Tool** | Vite | 7.x |
| **CSS Framework** | Tailwind CSS | 3.4+ |
| **Routing** | Vue Router | 4.x |
| **State Management** | Pinia | 3.x |
| **HTTP Client** | Axios | 1.x |
| **Date/Time** | dayjs | 1.11+ |
| **Code Quality** | ESLint + Prettier | - |
| **Package Manager** | pnpm | 10.x |

## 프로젝트 구조

**Feature-based Architecture** 채택으로 기능별 응집도 최대화

```
src/
├── features/                   # 기능별 모듈
│   ├── queue/                  # 대기열 시스템
│   │   ├── components/         # 대기열 컴포넌트
│   │   │   ├── QueueStatus.vue
│   │   │   ├── QueueTimer.vue
│   │   │   └── QueueProgress.vue
│   │   ├── api/                # 대기열 API
│   │   │   └── queueApi.ts
│   │   ├── stores/             # 대기열 상태 관리
│   │   │   └── useQueueStore.ts
│   │   ├── types/              # 대기열 타입
│   │   │   └── queue.types.ts
│   │   └── views/              # 대기열 페이지
│   │       └── QueuePage.vue
│   │
│   ├── seat/                    # 좌석 선택
│   │   ├── components/
│   │   │   ├── SeatMap.vue
│   │   │   ├── SeatInfo.vue
│   │   │   └── SeatCart.vue
│   │   ├── api/
│   │   │   └── seatApi.ts
│   │   ├── stores/
│   │   │   └── useSeatStore.ts
│   │   ├── types/
│   │   │   └── seat.types.ts
│   │   └── views/
│   │       └── SeatSelectionPage.vue
│   │
│   └── payment/                 # 결제
│       ├── components/
│       │   ├── PaymentForm.vue
│       │   ├── PaymentSummary.vue
│       │   └── PaymentTimer.vue
│       ├── api/
│       │   └── paymentApi.ts
│       ├── stores/
│       │   └── usePaymentStore.ts
│       ├── types/
│       │   └── payment.types.ts
│       └── views/
│           └── PaymentPage.vue
│
├── shared/                      # 공유 리소스
│   ├── components/              # 공통 컴포넌트
│   │   ├── Button.vue
│   │   ├── Input.vue
│   │   ├── Modal.vue
│   │   └── Loading.vue
│   ├── api/                     # 공통 API 설정
│   │   └── client.ts
│   ├── utils/                   # 유틸리티 함수
│   │   ├── formatter.ts
│   │   └── validator.ts
│   ├── types/                   # 공통 타입
│   │   └── common.types.ts
│   └── constants/               # 상수
│       └── index.ts
│ 
├── router/                      # 라우팅 설정
│   └── index.ts
│
├── assets/                      # 정적 파일
│   ├── images/
│   └── styles/
│
├── App.vue
├── main.ts
└── style.css
```

## 시작하기

### 필수 요구사항

- **Node.js** 18+ (LTS)
- **pnpm** 10.x
- **백엔드 API** 서버 실행 중 (http://localhost:8080)

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone <repository-url>
cd FairTicket-FE

# 2. pnpm 설치 (없는 경우)
npm install -g pnpm

# 3. 의존성 설치
pnpm install

# 4. 개발 서버 실행
pnpm dev
```

브라우저에서 **http://localhost:5173** 접속
