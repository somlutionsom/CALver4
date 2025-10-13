# 심플 캘린더 위젯

Notion 데이터베이스와 연동하여 사용할 수 있는 심플하고 깔끔한 캘린더 위젯입니다.

## 저장소 정보
- **GitHub URL**: https://github.com/somlutionsom/CALver4
- **배포 URL**: [Vercel 배포 예정]
- **프로젝트 유형**: 웹앱 (Notion DB 연동 캘린더 위젯)

## 주요 기능

- 📅 **Notion DB 자동 연동**: 날짜 속성 기반으로 일정 자동 표시
- 🎨 **커스터마이즈 가능**: 색상 테마 설정 지원
- 📱 **반응형 디자인**: 데스크톱과 모바일 모두 지원
- 🔒 **보안**: API 키 암호화 저장
- ⚡ **빠른 성능**: 캐싱 및 최적화 적용
- ♿ **접근성**: WCAG 가이드라인 준수

## 빠른 시작

### 1. 사전 요구사항

- Node.js 18.0.0 이상
- npm 9.0.0 이상
- Notion 계정 및 Integration API 키

### 2. 설치

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 값 설정
```

### 3. Notion 설정

#### Notion Integration 생성

1. [Notion Developers](https://www.notion.so/my-integrations)에 접속
2. "New Integration" 클릭
3. 이름 설정 및 워크스페이스 선택
4. Capabilities에서 필요한 권한 설정:
   - Read content
   - Read user information
5. "Submit" 클릭 후 API 키 복사

#### Database 연결

1. Notion에서 사용할 데이터베이스 열기
2. 오른쪽 상단 "..." → "Connections" → Integration 선택
3. 데이터베이스 URL에서 ID 복사

**필수 속성:**
- 날짜 (Date 타입)
- 제목 (Title 타입) - 이벤트 이름으로 사용
- 중요 (Select 또는 Checkbox 타입) - 선택사항

**⚠️ DB 구조 (v2.1.0):**
- **현재 모델**: 1개 페이지 = 1개 이벤트
  - 각 일정을 별도 페이지로 생성
  - **페이지 제목만 이벤트 이름으로 사용**
  - [일정1~5] 속성은 **완전히 무시됨**
  
- **⚠️ 중요**: 레거시 모델(일정1~5 속성)은 더 이상 지원되지 않습니다.
  - 기존 DB 사용 시 마이그레이션 필요
  - `npm run migrate` 명령어로 자동 마이그레이션

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속

### 5. 프로덕션 빌드

```bash
npm run build
npm start
```

## 사용 방법

### 위젯 설정

1. `/onboarding` 페이지 접속
2. Step 1: Notion API 키와 Database ID 입력
3. Step 2: 데이터베이스 속성명 매핑
4. Step 3: 색상 테마 설정
5. 생성된 임베드 URL 복사

### 위젯 임베드

#### iframe으로 임베드

```html
<iframe 
  src="https://your-domain.com/u/YOUR_CONFIG_ID" 
  width="100%" 
  height="600" 
  frameborder="0">
</iframe>
```

#### Notion 페이지에 임베드

1. Notion 페이지에서 `/embed` 입력
2. 위젯 URL 붙여넣기
3. 크기 조절

## API 엔드포인트

### POST `/api/setup`
위젯 설정을 생성하고 저장합니다.

### GET `/api/events/[configId]`
캘린더 이벤트를 조회합니다.

**쿼리 파라미터:**
- `startDate`: YYYY-MM-DD 형식
- `endDate`: YYYY-MM-DD 형식

### POST `/api/preview`
설정 미리보기를 생성합니다.

## 보안 고려사항

### API 키 보호

- ✅ API 키는 서버에서만 사용되며 클라이언트에 노출되지 않음
- ✅ 모든 설정 데이터는 AES-256-GCM으로 암호화되어 저장
- ✅ HTTPS를 통한 안전한 통신 필수

### 환경변수 설정

**필수 환경변수:**
```env
# 32자 이상의 강력한 암호화 키 사용
ENCRYPTION_KEY=your-very-strong-32-character-key!!

# 프로덕션 환경에서 필수
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 성능 최적화

### 캐싱 전략

- 이벤트 데이터: 60초 캐시 (Cache-Control)
- Stale-while-revalidate로 사용자 경험 개선

## 접근성

### WCAG 2.1 준수

- ✅ 키보드 네비게이션 지원
- ✅ 스크린 리더 호환 (ARIA 레이블)
- ✅ 고대비 모드 지원
- ✅ 최소 44px 터치 타겟
- ✅ 명확한 포커스 표시

## 데이터베이스 마이그레이션

### 레거시 DB → 새 모델 마이그레이션

기존 DB(1페이지=1날짜)를 새 모델(1페이지=1이벤트)로 마이그레이션하려면:

#### 1. 준비

```bash
# tsx 설치 (개발 의존성)
npm install
```

#### 2. 환경 변수 설정

```bash
# 터미널에서 실행
export NOTION_API_KEY="your-notion-api-key"
export SOURCE_DATABASE_ID="source-database-id"
export TARGET_DATABASE_ID="target-database-id"  # 선택사항, 생략 시 SOURCE와 동일
```

**Windows (PowerShell):**
```powershell
$env:NOTION_API_KEY="your-notion-api-key"
$env:SOURCE_DATABASE_ID="source-database-id"
$env:TARGET_DATABASE_ID="target-database-id"
```

#### 3. 마이그레이션 실행

```bash
npm run migrate
```

#### 4. 마이그레이션 프로세스

1. **Dry Run**: 먼저 실제 변경 없이 계획을 확인합니다
2. **확인 프롬프트**: 계속 진행할지 묻습니다
3. **실제 마이그레이션**: 각 일정을 개별 페이지로 생성합니다
4. **완료 보고**: 통계와 결과를 표시합니다

#### 5. 주의사항

⚠️ **중요:**
- 마이그레이션은 새 페이지를 생성만 하고 기존 페이지는 삭제하지 않습니다
- 마이그레이션 후 데이터를 확인하고, 문제가 없으면 기존 페이지를 수동으로 삭제하세요
- 대용량 DB는 Notion API 요청 제한(3 req/sec)으로 시간이 걸릴 수 있습니다
- 백업을 권장합니다

#### 6. 마이그레이션 예시

**기존 DB (레거시 모델):**
| 날짜 | 제목 | 일정1 | 일정2 | 일정3 | 중요 |
|------|------|-------|-------|-------|------|
| 2024-01-15 | 업무일정 | 회의 | 발표 | 보고서 작성 | ✓ |

**마이그레이션 후 (새 모델):**
| 날짜 | 제목 | 중요 |
|------|------|------|
| 2024-01-15 | 회의 | ✓ |
| 2024-01-15 | 발표 | ✓ |
| 2024-01-15 | 보고서 작성 | ✓ |

## 문제 해결

### 일반적인 문제

#### "Database not found" 오류
- Database ID가 올바른지 확인
- Integration이 데이터베이스에 연결되어 있는지 확인

#### "Invalid API key" 오류
- API 키가 정확한지 확인
- Integration이 활성화되어 있는지 확인

#### 일정이 표시되지 않음
- 날짜 속성명이 정확한지 확인
- 날짜 형식이 올바른지 확인 (Date 타입)

## 배포

### 배포 전 체크리스트 ✅

Vercel 배포 전에 잠재적인 빌드 오류를 방지하기 위한 자동 체크:

```bash
# 배포 전 체크 실행
npm run pre-deploy
```

**체크 항목:**
1. ✅ Build Script 존재 여부
2. ✅ vercel.json 유효성 검증
3. ✅ 의존성 무결성 (node_modules, package-lock.json)
4. ✅ 환경 변수 설정 확인
5. ✅ 빌드 크기 제한 (node_modules < 1GB)
6. ✅ ignoreCommand 감지 (빌드 스킵 방지)
7. ✅ Git 권한 및 브랜치 확인
8. ✅ 캐시 사용량 (< 1GB)
9. ✅ 빌드 시간 예측
10. ✅ 빌드 출력 검증 (.next 폴더)

**결과:**
- 🟢 PASS: 문제 없음
- 🟡 WARN: 확인 필요
- 🔴 FAIL: 수정 필요

**설정 커스터마이징:**

`.predeployrc` 파일을 생성하여 프로젝트별 설정 가능:

```json
{
  "skipChecks": [],
  "buildSizeLimit": {
    "nodeModules": "1GB",
    "cache": "1GB"
  },
  "requiredEnvVars": [
    "ENCRYPTION_KEY"
  ],
  "buildTimeout": 600,
  "autoFix": false,
  "verbose": false
}
```

### Vercel 배포

#### 자동 배포 (권장)

```bash
# pre-deploy 체크 + Vercel 배포
npm run deploy
```

#### 수동 배포

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/simple-calendar-widget)

또는 CLI 사용:

```bash
# 1. pre-deploy 체크
npm run pre-deploy

# 2. Vercel 배포
vercel

# 또는 프로덕션 배포
vercel --prod
```

### 로컬 빌드 테스트

```bash
# 빌드
npm run build

# 프로덕션 실행
npm start
```

### CI/CD 통합

GitHub Actions, GitLab CI 등에서 사용:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run pre-deploy
      - run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

## 라이선스

MIT

## 크레딧

- Next.js 15+ 기반
- Notion API 활용
- TypeScript로 작성
