# FairTicket-FE
## 대용량 트래픽 처리 공정 티켓팅 시스템 프론트엔드
> Vue 3 + TypeScript + Tailwind CSS 기반 티켓팅 웹 클라이언트 <br>
> 듀얼 트랙(사전 예매/실시간 선착순) 방식으로 트래픽을 분산하고 공정성을 강화하는 구조 <br>
> 25.01.20 - 25.02.19

---

## 🎥 시연 영상
<p align="center">
  <a href="https://youtu.be/c5Nu2MAlWs8">
    <img src="https://img.youtube.com/vi/c5Nu2MAlWs8/0.jpg" alt="시연 영상" width="600"/>
  </a>
</p>

---

## 📱 Contributors
| 양정우 (PM / PL) <br> [@mrangjw](https://github.com/mrangjw) | 권세빈 (Frontend) <br> [@sebeeeen](https://github.com/sebeeeen) |
|:---:|:---:|
| <img width="150" src="https://avatars.githubusercontent.com/u/157506327?v=4"/> | <img width="150" src="https://avatars.githubusercontent.com/u/128478309?v=4"/> |
| 프론트엔드 개발<br>대기열 시스템 UI 구현<br>좌석 선택 인터페이스 개발<br>결제 연동 (PortOne V2) | 프론트엔드 개발<br>공연 목록 및 상세 페이지<br>Lottery Track UI 구현<br>마이티켓 페이지 개발 |

<br/>

## 💡 프로젝트 배경

### 해결하고자 하는 문제
- ⚡ **트래픽 집중**: 오픈 후 1~2분 내 트래픽의 90%가 집중, 서버 다운·504 에러·결제 중단 발생
- 🎫 **불공정한 경쟁**: 2024 예스24 실측 기준 매크로 트래픽 73.5%, 정상 사용자 26.5% — "빠른 클릭 = 좋은 자리" 구조는 매크로·고성능 장비에만 유리
- 🔄 **좌석 선택 vs 확보 확실성 충돌**: 원하는 좌석 선택 또는 확보 확실성 중 하나만 가능한 기존 구조
- 📋 **대기 불확실성**: 무한 새로고침 → 이탈 → 서버 추가 부하의 악순환

### 솔루션: 듀얼 트랙 예매 시스템
- **Lottery Track (사전 예매)**: 등급 선택 → 결제 → Live Track 마감 후 Fisher-Yates 알고리즘으로 좌석 랜덤 배정 (좌석 확보 확실성 보장, 매크로 무력화)
- **Live Track (실시간 선착순)**: Redis 대기열 진입 → 순번 대기 → 좌석 직접 선택 → 10분 홀드 → 결제 (좌석 선택권 보장)

<br/>

## 🔧 Tech Stacks
| Category | TechStack |
| --- | --- |
| Framework | Vue 3.5 |
| Language | TypeScript 5.9 |
| Build Tool | Vite 7 |
| CSS Framework | Tailwind CSS 3.4 |
| Routing | Vue Router 4 |
| State Management | Pinia 3 |
| HTTP Client | Axios |
| Date / Time | dayjs |
| Icon | Lucide Vue |
| Payment | PortOne V2 SDK |
| Code Quality | ESLint + Prettier |
| Package Manager | pnpm 10 |

<br/>

## 🏗️ 핵심 구현 기능

### 🎰 듀얼 트랙 예매 UI
- **Lottery Track (사전 예매)**: 등급 선택 + 수량 조절(최대 2장) → 사전 결제 → 좌석 랜덤 배정 대기
- **Live Track (실시간 선착순)**: 공연장 맵에서 구역 선택 → 좌석 그리드에서 직접 좌석 선택(최대 4장) → 10분 홀드 → 결제

### 📋 실시간 대기열 시스템
- 3초 간격 Polling으로 실시간 순번 및 예상 대기시간 표시
- 30초 간격 Heartbeat 전송으로 세션 유지
- 순번 도달 시 Lottery/Live 트랙 페이지로 자동 리다이렉트
- 프로그레스 바 기반 대기 상태 시각화

### 💺 좌석 선택 인터페이스
- 공연장 전체 맵(VenueMap) → 구역별 좌석 그리드(SeatMap) 2단계 선택
- 등급별 색상 구분 (VIP / S / A석)
- 줌/팬 컨트롤 지원
- 선택된 좌석 실시간 카운트 표시

### 💳 결제 시스템
- PortOne V2 SDK 연동 (토스페이먼츠 / 카카오페이 / 토스페이)
- 결제 수단별 채널키 자동 매핑
- 5분 결제 타이머 카운트다운 표시
- 결제 완료 후 Webhook 검증 및 결과 페이지

### 🔐 인증
- JWT 기반 로그인 / 회원가입
- Axios 인터셉터로 토큰 자동 첨부 (`Authorization: Bearer`)
- 401 응답 시 로그인 페이지 자동 리다이렉트
- AuthGuard 컴포넌트로 보호된 라우트 관리

### 📡 API 연동
- 8개 API 모듈 (Auth, Concert, Queue, Schedule, Seat, Reservation, Payment, Admin)
- Mock API 토글 (`VITE_USE_MOCK`) 지원으로 BE 없이 개발 가능
- Axios 인스턴스 기반 공통 에러 핸들링

<br/>

## 📁 Foldering
```
📂 src
┣ 📂 api                    # API 모듈
┃ ┣ 📂 mock                 # Mock 데이터
┃ ┣ auth.api.ts
┃ ┣ concert.api.ts
┃ ┣ queue.api.ts
┃ ┣ schedule.api.ts
┃ ┣ seat.api.ts
┃ ┣ reservation.api.ts
┃ ┣ payment.api.ts
┃ ┗ client.ts               # Axios 인스턴스 + 인터셉터
┣ 📂 components             # 재사용 컴포넌트
┃ ┣ 📂 concert              # 공연 카드, 그리드
┃ ┣ 📂 layout               # 헤더, 푸터, AuthGuard
┃ ┣ 📂 queue                # 대기열 프로그레스
┃ ┣ 📂 seat                 # SeatMap, VenueMap
┃ ┗ 📂 ui                   # Toast, Confetti, FlipNumber, Skeleton
┣ 📂 composables             # Vue Composables
┃ ┣ useAuth.ts
┃ ┣ useCountdown.ts
┃ ┣ usePolling.ts
┃ ┗ useToast.ts
┣ 📂 router                  # Vue Router 설정
┣ 📂 stores                  # Pinia 상태 관리
┃ ┣ auth.store.ts
┃ ┣ queue.store.ts
┃ ┣ payment.store.ts
┃ ┗ seat.store.ts
┣ 📂 types                   # TypeScript 타입 정의
┣ 📂 views                   # 12개 페이지
┃ ┣ IntroPage.vue
┃ ┣ HomePage.vue
┃ ┣ LoginPage.vue
┃ ┣ SignupPage.vue
┃ ┣ ConcertDetailPage.vue
┃ ┣ QueuePage.vue
┃ ┣ LotteryPage.vue
┃ ┣ SeatsPage.vue
┃ ┣ PaymentPage.vue
┃ ┣ PaymentResultPage.vue
┃ ┣ MyTicketsPage.vue
┃ ┗ NotFoundPage.vue
┣ App.vue
┣ main.ts
┗ style.css

📂 public/venues             # 공연장 좌석 배치 JSON
┣ 올림픽공원 체조경기장.json
┗ 잠실종합운동장.json
```

<br/>

## 🛠️ 로컬 개발 환경 설정

### 사전 요구사항
- Node.js 18+ (LTS)
- pnpm 10.x
- 백엔드 API 서버 실행 중 (http://localhost:8080)

### 1. 레포지토리 클론
```bash
git clone https://github.com/FairTicket-Lab/FairTicket-FE.git
cd FairTicket-FE
```

### 2. 의존성 설치
```bash
pnpm install
```

### 3. 개발 서버 실행
```bash
pnpm dev
```

브라우저에서 **http://localhost:5173** 접속

---
> #### &copy; 2025 FairTicket | Fair Ticketing Platform for Everyone | All Rights Reserved
