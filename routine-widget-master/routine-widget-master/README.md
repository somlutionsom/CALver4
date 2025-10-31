# 🎮 Notion Pixel Widget

Notion 데이터베이스와 실시간 연동되는 픽셀 아트 스타일의 개인 프로필 위젯 서비스

## 📌 저장소 정보

- **GitHub URL**: [https://github.com/USER/1017routine-profile-widgetver1](https://github.com/USER/1017routine-profile-widgetver1)
- **배포 URL**: [https://your-vercel-deployment-url.vercel.app](https://your-vercel-deployment-url.vercel.app)
- **프로젝트 유형**: 웹앱 (Next.js 15)

## ✨ 주요 기능

- 🔗 **Notion API 연동**: Notion 데이터베이스와 실시간 동기화
- 🎨 **5가지 테마**: 핑크, 퍼플, 블루, 그린, 모노크롬 테마 지원
- 🖼️ **픽셀 아트 스타일**: 레트로 감성의 귀여운 UI
- ⚡ **실시간 업데이트**: 2분마다 자동 데이터 갱신
- 📱 **Notion 임베드**: Notion 페이지에 직접 임베드 가능
- 🔐 **보안**: 안전한 위젯 토큰 처리 (Base64 + in-memory fallback)

## 🚀 설치 및 실행

### 1. 저장소 클론

```bash
git clone [저장소 URL]
cd routine-profile-ver1
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_ENCRYPTION_KEY=your-super-secret-encryption-key-must-be-32-chars!
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

⚠️ **중요**: `ENCRYPTION_KEY`는 반드시 32자 이상이어야 합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🔧 Notion Integration 설정

### 1. Integration 생성

1. [notion.so/my-integrations](https://www.notion.so/my-integrations) 접속
2. "새 Integration 만들기" 클릭
3. Integration 이름 입력 (예: "Pixel Widget")
4. **권한 설정**: "Read content" 체크
5. "제출" 클릭
6. **Secret 토큰 복사** (ntn_로 시작)

### 2. 데이터베이스 공유

1. 사용할 Notion 데이터베이스 페이지 열기
2. 우측 상단 "..." → "연결" → 생성한 Integration 선택
3. "초대" 클릭

### 3. 필수 데이터베이스 속성

데이터베이스에 다음 속성이 필요합니다:

| 속성 이름 | 타입 | 설명 |
|---------|------|------|
| `Date` | Date | 날짜 (필터링에 사용) |
| `profile image` | Files & media | 프로필 이미지 |
| `sleep` | Formula | 수면 시간 (예: "8H") |
| `energy` | Number | 에너지 레벨 (0-5) |
| `name` | Text | 이름 |
| `main text` | Text | 상태 메시지 |

## 📖 셀프 테스트 & 디버깅 체크리스트

모바일 노션 앱(WebView) 환경에서 위젯이 정상 동작하는지 확인하려면 `/widget-test` 라우트를 사용하세요. 아래 항목을 순서대로 점검합니다.

1. `/widget-test` 페이지를 열고 스크롤이 가능한지 확인합니다.
2. 화면을 2초 이상 길게 눌러 **디버그 오버레이**가 노출되는지 확인합니다.
3. 오버레이에 User-Agent, viewport, 로그가 출력되는지 확인합니다.
4. 오버레이를 닫고 `/widget` 페이지로 이동해 실제 위젯 데이터를 검증합니다.
5. 데이터가 비어 있거나 에러가 표시되면 오버레이 로그를 캡처하여 공유합니다.

### 디버그 오버레이 주요 정보

- 최근 로그 50개 (fetch 성공/실패, viewport 변화, 에러 등)
- UA, viewport 크기, referrer 헤더
- `/api/debug/log` 원격 전송 결과 (keepalive)

### 추천 테스트 시나리오

- Wi-Fi ↔ LTE 전환 후 데이터 정상 로드시 재시도
- 화면 회전(Landscape) 시 레이아웃 깨짐 여부 확인
- 다크 모드에서 대비/가독성 확인
- 위젯을 여러 번 터치해 테마 순환 및 상태 저장 확인

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, 픽셀 폰트 (NeoDonggeunmo, DotGothic16)
- **API**: Notion API (@notionhq/client)
- **위젯 안전장치**: safeStorage (in-memory fallsback), ResizeObserver 폴리필, requestIdleCallback 스케줄러, 디버그 오버레이
- **배포**: Vercel

## 📁 프로젝트 구조

```
routine-profile-ver1/
├── app/
│   ├── api/
│   │   └── notion/
│   │       ├── databases/route.ts       # DB 목록 조회 API
│   │       └── widget-data/route.ts     # 위젯 데이터 조회 API
│   ├── components/
│   │   ├── OnboardingFlow.tsx           # 온보딩 컴포넌트
│   │   └── WidgetPreview.tsx            # 미리보기 컴포넌트
│   ├── widget/
│   │   └── page.tsx                     # 위젯 페이지
│   ├── globals.css                      # 글로벌 스타일
│   ├── layout.tsx                       # 루트 레이아웃
│   └── page.tsx                         # 메인 페이지
├── lib/
│   └── utils.ts                         # 유틸리티 함수
├── public/
│   └── images/                          # 이미지 리소스
├── next.config.js                       # Next.js 설정
├── tailwind.config.js                   # Tailwind 설정
└── package.json
```

## 🚢 배포 (Vercel)

### 1. Vercel 프로젝트 생성

```bash
npm install -g vercel
vercel
```

### 2. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수 추가:

- `NEXT_PUBLIC_ENCRYPTION_KEY`: 32자 이상의 랜덤 문자열
- `NEXT_PUBLIC_APP_URL`: 배포된 도메인 (예: https://your-widget.vercel.app)

### 3. 배포

```bash
vercel --prod
```

## 🔒 보안

- API 토큰은 AES-256으로 암호화되어 URL에 포함됩니다
- 서버사이드에서만 토큰이 복호화됩니다
- HTTPS 필수 (Vercel 자동 적용)
- iframe 임베드를 위한 CSP 헤더 설정 완료

## 📝 라이선스

MIT License

## 🤝 기여

이슈와 PR은 언제나 환영합니다!

## 📧 문의

문제가 발생하면 GitHub Issues에 등록해주세요.
# Updated Thu Oct 16 20:27:21 KST 2025
