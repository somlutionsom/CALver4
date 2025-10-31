<!-- 7f38d7a6-cef2-4d9e-969c-13b341a68b6b fea6ab79-66d7-4c02-99be-b330cd94ffa3 -->
# Notion Pixel Widget 전체 구현 플랜

## 1단계: 프로젝트 환경 설정

### 의존성 및 설정 파일

- `package.json`: @notionhq/client, crypto-js, clsx 등 의존성 추가
- `next.config.ts` → `next.config.js` 변환: X-Frame-Options, CSP 헤더 설정, Notion 이미지 도메인 추가
- `tailwind.config.js` 수정: 5가지 테마 컬러, NeoDonggeunmo 폰트, 픽셀 애니메이션
- `.env.local` 생성: NEXT_PUBLIC_ENCRYPTION_KEY (32자), NEXT_PUBLIC_APP_URL

### 스타일 및 레이아웃

- `app/globals.css`: NeoDonggeunmo 폰트 CDN, 픽셀 스타일 클래스(.pixel-border, .pixel-button, .window-frame, .speech-bubble)
- `app/layout.tsx`: 메타데이터, 뷰포트, 폰트 로드

## 2단계: 메인 온보딩 페이지

### 홈 페이지 구현

- `app/page.tsx`: 2컬럼 레이아웃 (OnboardingFlow + WidgetPreview), 그라데이션 배경

## 3단계: 온보딩 플로우 컴포넌트

### 3단계 온보딩 구현

- `app/components/OnboardingFlow.tsx`:
- **Step 1**: Notion 토큰 입력 (ntn_ 검증), 연결 테스트
- **Step 2**: DB 선택 드롭다운, 5가지 테마 선택 그리드, 필수 속성 안내
- **Step 3**: 위젯 URL 생성 완료, 복사 버튼, Notion 임베드 가이드
- AES-256 암호화로 URL 생성

## 4단계: 위젯 미리보기 컴포넌트

### 실시간 미리보기

- `app/components/WidgetPreview.tsx`: iframe으로 위젯 임베드, 윈도우 프레임 스타일

## 5단계: 위젯 페이지 (핵심)

### 픽셀 위젯 렌더링

- `app/widget/page.tsx`:
- URL 파라미터 복호화 (config)
- 실시간 시계 (useEffect)
- 2분 자동 새로고침
- 5가지 테마 순환 (클릭 이벤트)
- **이미지 사용**: 
  - `image/window.png`: 배경 이미지
  - `image/battery.png`: ⚡ 에너지 아이콘 대체
  - `image/moon.png`: 🌙 수면시간 아이콘 대체
  - `image/강아지프로필.png`: 기본 프로필
  - `image/꺽쇠.png`, `image/꺽쇠2.png`: 대사창 좌우 장식
- 350×450px 고정 크기
- 에너지: 0-5 → 0-100% 변환
- 수면시간: Formula 값 표시
- 말풍선: 게임 UI 스타일 대사창

## 6단계: Notion API 연동

### API Routes 구현

- `app/api/notion/databases/route.ts`:
- POST 요청으로 토큰 받기
- Notion SDK로 워크스페이스 DB 목록 조회
- 결과 반환

- `app/api/notion/widget-data/route.ts`:
- 토큰 + DB ID로 데이터 조회
- 오늘 날짜 필터 (Date 속성 기준)
- 오늘 데이터 없으면 최근 데이터 조회
- 속성 매핑:
  - `profile image` (Files & media)
  - `sleep` (Formula)
  - `energy` (Number, 0-5)
  - `name` (Text)
  - `main text` (Text)
- 데이터 없으면 기본값 반환

## 7단계: 유틸리티

### 헬퍼 함수

- `lib/utils.ts`: cn(), formatDate(), formatTime() 함수

## 8단계: 이미지 폴더 정리

### 이미지 마이그레이션

- `image/` 폴더의 모든 PNG를 `public/images/`로 복사
- 한글 파일명 영문 변경:
- `강아지프로필.png` → `default-profile.png`
- `꺽쇠.png` → `bracket-left.png`
- `꺽쇠2.png` → `bracket-right.png`

## 9단계: 문서화

### README.md 업데이트

- 프로젝트 설명
- 설치 및 실행 방법
- Notion Integration 생성 가이드
- 필수 DB 속성 명세
- 환경변수 설정
- Vercel 배포 가이드

## 10단계: 최종 점검

### 테스트 및 검증

- 로컬 개발 서버 실행 (`npm run dev`)
- 온보딩 플로우 테스트
- 위젯 렌더링 확인
- 에러 처리 검증
- 반응형 확인

### To-dos

- [ ] 프로젝트 환경 설정 (package.json, next.config, tailwind, .env)
- [ ] 스타일 및 레이아웃 파일 (globals.css, layout.tsx)
- [ ] 메인 홈 페이지 구현 (page.tsx)
- [ ] 온보딩 플로우 컴포넌트 (OnboardingFlow.tsx, 3단계)
- [ ] 위젯 미리보기 컴포넌트 (WidgetPreview.tsx)
- [ ] 위젯 페이지 구현 (widget/page.tsx, 이미지 적용)
- [ ] Notion API 연동 (databases, widget-data routes)
- [ ] 유틸리티 함수 (lib/utils.ts)
- [ ] 이미지 폴더 정리 및 마이그레이션
- [ ] README.md 업데이트