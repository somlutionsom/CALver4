# Pre-Deploy 체크리스트 가이드

## 개요

Vercel 배포 전 빌드 오류를 사전에 감지하는 자동 검증 스크립트입니다.

## 사용법

### 기본 실행

```bash
npm run pre-deploy
```

### 배포와 함께 실행

```bash
npm run deploy  # pre-deploy 체크 + vercel 배포
```

## 체크 항목 (10가지)

### 1. ✅ Build Script 체크
- `package.json`에 `build` 스크립트 존재 확인
- Next.js, Vite 등 빌드 명령어 검증

**통과 조건:**
- `"build": "next build"` 또는 유사한 명령어 존재

**실패 시:**
```json
{
  "scripts": {
    "build": "next build"
  }
}
```

### 2. ✅ vercel.json 검증
- JSON 문법 오류 감지
- 유효한 Vercel 설정 확인

**통과 조건:**
- vercel.json이 없거나 유효한 JSON

**실패 시:**
- JSON 문법 오류 수정

### 3. ✅ 의존성 오디트
- `node_modules` 존재 확인
- `package-lock.json` 존재 확인
- `engines` 필드 검증

**통과 조건:**
- 의존성이 설치되어 있음

**경고 시:**
```bash
npm install
```

### 4. ✅ 환경 변수 체크
- `.env.example`에서 필수 환경 변수 추출
- Vercel에서 설정 필요한 변수 확인

**통과 조건:**
- 필수 환경 변수 인식

**확인 필요:**
- Vercel Dashboard → Settings → Environment Variables

### 5. ✅ 빌드 크기 제한
- `node_modules` 크기: < 1GB (권장: < 500MB)
- 대용량 라이브러리 감지

**통과 조건:**
- node_modules < 1GB

**경고 시:**
```bash
# 불필요한 의존성 제거
npm uninstall <unused-package>

# 프로덕션 의존성만 설치
npm ci --production
```

### 6. ✅ Ignored Steps 감지
- `vercel.json`의 `ignoreCommand` 확인
- 의도치 않은 빌드 스킵 방지

**통과 조건:**
- ignoreCommand 없음

**경고 시:**
```json
{
  "git": {
    "ignoreCommand": "git diff HEAD^ HEAD --quiet ."
  }
}
```
→ 이 설정이 의도된 것인지 확인

### 7. ✅ Git 권한 체크
- Git 저장소 확인
- 현재 브랜치 표시
- 마지막 커밋 정보

**통과 조건:**
- Git 저장소이고 커밋이 있음

**경고 시:**
```bash
git init
git add .
git commit -m "Initial commit"
```

### 8. ✅ 캐시 사용량
- `.next/cache` 크기: < 1GB
- 캐시 초과 시 경고

**통과 조건:**
- 캐시 < 1GB

**경고 시:**
```bash
rm -rf .next/cache
```

### 9. ✅ 빌드 시간 예측
- 로컬 빌드 시간 측정 (선택사항)
- OOM 오류 감지

**통과 조건:**
- 시뮬레이션 생략 (수동 테스트 권장)

**수동 테스트:**
```bash
npm run build
```

### 10. ✅ 빌드 출력 검증
- `.next` 폴더 존재 확인
- `build-manifest.json` 확인

**통과 조건:**
- 빌드 출력 존재

**경고 시:**
```bash
npm run build
```

## 결과 해석

### 🟢 PASS
문제 없음. 배포 가능.

### 🟡 WARN
확인 필요. 배포는 가능하지만 문제가 발생할 수 있음.

### 🔴 FAIL
수정 필요. 배포 전에 반드시 해결해야 함.

## 설정 파일

### `.predeployrc`

프로젝트별 설정을 커스터마이즈할 수 있습니다:

```json
{
  "skipChecks": ["BuildTime", "GitPermissions"],
  "buildSizeLimit": {
    "nodeModules": "800MB",
    "cache": "500MB"
  },
  "requiredEnvVars": [
    "ENCRYPTION_KEY",
    "NEXT_PUBLIC_BASE_URL",
    "NOTION_API_KEY"
  ],
  "buildTimeout": 600,
  "autoFix": false,
  "verbose": true
}
```

**옵션 설명:**
- `skipChecks`: 건너뛸 체크 항목 (배열)
- `buildSizeLimit`: 빌드 크기 제한 설정
- `requiredEnvVars`: 필수 환경 변수 목록
- `buildTimeout`: 빌드 타임아웃 (초)
- `autoFix`: 자동 수정 시도 (미구현)
- `verbose`: 상세 로그 출력

## 일반적인 문제 해결

### 문제: "node_modules가 없습니다"

**해결:**
```bash
npm install
```

### 문제: "Build Script가 없습니다"

**해결:**
```json
{
  "scripts": {
    "build": "next build"
  }
}
```

### 문제: "node_modules가 너무 큽니다"

**해결:**
```bash
# 1. 불필요한 패키지 제거
npm uninstall <package>

# 2. devDependencies와 dependencies 분리
# devDependencies는 빌드 시 포함되지 않음

# 3. 번들 분석
npx next-bundle-analyzer
```

### 문제: "환경 변수가 설정되지 않았습니다"

**해결:**
1. Vercel Dashboard 접속
2. Project → Settings → Environment Variables
3. 필요한 변수 추가
4. Redeploy

### 문제: "빌드 출력이 없습니다"

**해결:**
```bash
# 로컬 빌드 테스트
npm run build

# 오류 확인 및 수정
# 다시 pre-deploy 실행
npm run pre-deploy
```

## CI/CD 통합

### GitHub Actions

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Pre-deploy check
        run: npm run pre-deploy
      
      - name: Deploy to Vercel
        run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### GitLab CI

```yaml
deploy:
  stage: deploy
  image: node:18
  script:
    - npm ci
    - npm run pre-deploy
    - npm run build
    - npx vercel --prod
  only:
    - main
```

## 성능

- **실행 시간:** < 15초 (일반적으로 < 1초)
- **오프라인 작동:** Vercel API 불필요
- **보안:** 시크릿 로그 출력 안 함

## 제한사항

1. **빌드 시뮬레이션:** 실제 빌드는 수동으로 테스트해야 함
2. **환경 변수:** Vercel 대시보드에서 직접 확인 필요
3. **캐시 크기:** 대략적인 추정치

## 고급 사용법

### 특정 체크만 실행

`.predeployrc`에서 설정:

```json
{
  "skipChecks": ["BuildTime", "CacheUsage"]
}
```

### 커스텀 임계값

```json
{
  "buildSizeLimit": {
    "nodeModules": "500MB",
    "cache": "200MB"
  }
}
```

### Verbose 모드

```json
{
  "verbose": true
}
```

## 업데이트

스크립트 업데이트:

```bash
# package.json 버전 확인
git pull origin main
npm install
```

## 지원

문제가 있으면:
1. [GitHub Issues](https://github.com/your-repo/issues)
2. 로그 첨부 (`npm run pre-deploy > log.txt`)
3. 환경 정보 (Node.js 버전, OS)

## FAQ

### Q: 매번 실행해야 하나요?
**A:** Git hook으로 자동화하거나 CI/CD에 통합하세요.

### Q: FAIL이 나와도 배포할 수 있나요?
**A:** 기술적으로는 가능하지만 빌드 실패 가능성이 높습니다.

### Q: 실행 시간이 너무 오래 걸립니다.
**A:** 일부 체크를 `skipChecks`로 비활성화하세요.

### Q: 자동 수정 기능이 있나요?
**A:** 현재는 수동 수정이 필요합니다. 향후 추가 예정.

## 체크리스트

배포 전:
- [ ] `npm run pre-deploy` 실행
- [ ] PASS 또는 WARN만 있는지 확인
- [ ] 경고 항목 검토
- [ ] 로컬 빌드 테스트 (`npm run build`)
- [ ] 환경 변수 Vercel에 설정
- [ ] Git 커밋 및 푸시

배포 후:
- [ ] Vercel 빌드 로그 확인
- [ ] 배포된 사이트 동작 확인
- [ ] 오류 모니터링

---

**버전:** 1.0.0  
**마지막 업데이트:** 2024-01-10


