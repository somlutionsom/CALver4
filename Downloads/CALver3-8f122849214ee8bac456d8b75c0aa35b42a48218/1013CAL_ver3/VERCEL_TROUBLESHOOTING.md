# Vercel 404 오류 해결 가이드

## 🔍 문제 상황
- 배포는 성공했지만 `404: NOT_FOUND` 오류 발생
- 코드와 빌드는 정상

## ✅ Vercel Dashboard 설정 확인

### 1. Framework Preset 확인
**경로**: Project Settings → General → Framework Preset

**올바른 설정**:
```
Framework Preset: Next.js
```

**잘못된 설정**:
- Other
- Static Site
- (비어있음)

➡️ **수정 방법**: "Next.js" 선택 후 Save

---

### 2. Build & Development Settings 확인
**경로**: Project Settings → General → Build & Development Settings

**올바른 설정**:
```
Build Command:        npm run build (또는 자동)
Output Directory:     .next (자동 감지됨, 비워두거나 .next)
Install Command:      npm install (또는 자동)
Development Command:  npm run dev (또는 자동)
```

**잘못된 설정**:
- Output Directory가 `out`, `dist`, `public` 등으로 설정됨
- Build Command가 비어있음

➡️ **수정 방법**: 위 값으로 설정 후 Save

---

### 3. Root Directory 확인
**경로**: Project Settings → General → Root Directory

**올바른 설정**:
```
Root Directory: (비어있음 - 루트 사용)
```

**잘못된 설정**:
- `calver2-calver2` 또는 다른 하위 폴더로 설정됨

➡️ **수정 방법**: 비워두고 Save

---

### 4. Environment Variables 설정 (선택사항)
**경로**: Project Settings → Environment Variables

**필수 환경 변수**:
```
NODE_ENV=production (자동 설정됨)
```

**선택 환경 변수**:
```
NOTION_API_KEY=your_key_here (사용자가 온보딩에서 설정)
NOTION_DATABASE_ID=your_db_id_here (사용자가 온보딩에서 설정)
```

---

## 🔄 수정 후 재배포

### 방법 1: 자동 재배포
설정 변경 후 Vercel이 자동으로 재배포를 시작합니다.

### 방법 2: 수동 재배포
1. **Deployments** 탭 클릭
2. 최신 배포 찾기
3. **⋯** (점 3개) 클릭
4. **Redeploy** 선택

---

## 🎯 빠른 해결 체크리스트

- [ ] Framework Preset = **Next.js**
- [ ] Output Directory = **(비어있음 또는 .next)**
- [ ] Root Directory = **(비어있음)**
- [ ] Build Command = **npm run build (또는 자동)**
- [ ] Node.js Version = **18.x 이상**
- [ ] 재배포 완료

---

## 📱 추가 디버깅

### Vercel 배포 로그 확인
1. **Deployments** 탭
2. 최신 배포 클릭
3. **Build Logs** 확인
4. "Building..." 섹션에서 오류 메시지 찾기

### 일반적인 오류 메시지
```
Error: Could not find a production build in the '.next' directory
→ Output Directory 설정이 잘못됨

Error: No framework detected
→ Framework Preset이 설정되지 않음

404: NOT_FOUND
→ 프레임워크 설정 또는 라우팅 문제
```

---

## 💡 추가 팁

### Vercel CLI로 로컬 테스트
```bash
# Vercel CLI 설치
npm i -g vercel

# 로컬에서 Vercel 빌드 시뮬레이션
vercel build

# 프로덕션 미리보기
vercel
```

### Next.js 빌드 확인
```bash
# 로컬 빌드
npm run build

# 빌드 결과 확인
npm run start
```

로컬에서 `http://localhost:3000`이 정상 작동하면 Vercel 설정 문제입니다.

---

## 🆘 여전히 문제가 해결되지 않으면

1. **Vercel 프로젝트 삭제 후 재생성**
   - Dashboard → Project Settings → Advanced
   - Delete Project
   - GitHub 저장소 다시 연결
   - Framework Preset을 **Next.js**로 선택

2. **Support 문의**
   - https://vercel.com/support
   - 배포 URL과 Error Code 제공

---

## ✅ 해결 확인

설정 변경 후 다음을 확인하세요:
- 홈페이지 (`/`): "심플 캘린더 위젯" 페이지 표시
- 온보딩 (`/onboarding`): Notion 연동 설정 페이지 표시
- 404 오류 사라짐

성공! 🎉

