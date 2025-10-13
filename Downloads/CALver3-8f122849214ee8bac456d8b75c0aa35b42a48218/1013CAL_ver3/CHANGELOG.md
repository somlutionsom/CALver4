# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-01-10

### 🎉 Major Changes

#### 새로운 DB 구조 지원
- **1개 페이지 = 1개 이벤트** 모델 도입
- 하루에 무제한 이벤트 지원 (기존: 5개 제한)
- 더 간단하고 확장 가능한 DB 구조

### ✨ Added

#### 마이그레이션 도구
- `scripts/migrateEvents.ts`: 자동 마이그레이션 스크립트 추가
- `npm run migrate`: 마이그레이션 실행 명령어
- Dry run 모드로 안전한 마이그레이션 테스트
- 상세한 진행 상황 및 통계 보고

#### 문서
- `MIGRATION_GUIDE.md`: 상세한 마이그레이션 가이드
- `README.md`: DB 구조 변경 사항 및 마이그레이션 방법 추가
- 새 모델 vs 레거시 모델 비교 문서

### 🔄 Changed

#### 타입 정의
- `CalendarEvent.schedules`: 필수 → 선택사항 (`schedules?`)
- `NotionConfig.scheduleProperties`: 필수 → 선택사항 (`scheduleProperties?`)
- 레거시 호환성 유지를 위한 타입 변경

#### NotionService
- `parsePageToEvent()`: 새 모델과 레거시 모델 모두 지원
- `autoDetectProperties()`: scheduleProperties를 optional로 반환
- `validateDatabase()`: optional 속성 검증 로직 추가
- 각 페이지를 단일 이벤트로 처리하는 로직 추가

#### SimpleCalendar 컴포넌트
- 툴팁: 여러 이벤트의 title 표시 지원
- 레거시 모델: schedules 배열 표시
- 새 모델: 각 이벤트의 title 표시
- 두 모델 모두 자동으로 올바르게 렌더링

### 🛠️ Technical

#### 의존성
- `tsx@^4.19.2`: TypeScript 스크립트 실행을 위해 추가

#### API
- 모든 기존 API 엔드포인트는 변경 없음
- 하위 호환성 완전 유지

### 📚 Documentation

- DB 구조 변경 이유 및 장점 설명
- 단계별 마이그레이션 가이드
- FAQ 섹션 추가
- 예제 및 스크린샷

### 🐛 Fixed

- 없음 (이번 릴리스는 새 기능 추가)

### ⚠️ Breaking Changes

**없음!** 이 릴리스는 하위 호환성을 완전히 유지합니다.
- 기존 레거시 DB는 계속 작동
- 마이그레이션은 선택사항
- 자동 모델 감지 및 전환

### 🔒 Security

- 변경 없음
- 기존 보안 기능 유지

### 📋 Migration Path

#### 기존 사용자 (레거시 모델)
1. **업그레이드 후 아무 작업 불필요** - 그대로 작동
2. 원하면 `npm run migrate`로 새 모델로 전환 가능

#### 새 사용자
- 새 모델 사용 권장 (더 간단하고 강력함)

### 📊 Statistics

- 파일 변경: 7개
- 새 파일: 3개 (마이그레이션 스크립트, 가이드)
- 코드 추가: ~600 줄
- 테스트 커버리지: 유지

### 🙏 Credits

- 커뮤니티 피드백에 감사드립니다
- "하루 5개 이상 일정 지원" 요청에서 시작된 개선

---

## [1.0.0] - 2024-01-01

### 🎉 Initial Release

#### Features
- Notion DB 연동 캘린더 위젯
- 반응형 디자인
- 커스텀 테마 지원
- 보안 (API 키 암호화)
- 접근성 (WCAG 2.1)
- 성능 최적화 (캐싱)

#### DB Structure (Legacy Model)
- 1개 페이지 = 1개 날짜
- 일정1~5 속성으로 여러 일정 관리
- Date, Title, 중요 속성 지원

#### Components
- `SimpleCalendar`: 메인 캘린더 UI
- `LoadingSpinner`: 로딩 상태 표시
- `ErrorBoundary`: 에러 처리

#### API Endpoints
- `POST /api/setup`: 위젯 설정 생성
- `GET /api/events/[configId]`: 이벤트 조회
- `POST /api/events`: Body 기반 이벤트 조회
- `POST /api/databases`: DB 목록 조회
- `POST /api/analyze-database`: DB 스키마 분석

#### Documentation
- README.md: 설치 및 사용법
- 온보딩 플로우
- 문제 해결 가이드

---

## Version Naming

- **Major (X.0.0)**: 중요 기능 추가 또는 구조 변경
- **Minor (x.Y.0)**: 새로운 기능 추가 (하위 호환)
- **Patch (x.y.Z)**: 버그 수정 및 마이너 개선

## [2.1.0] - 2024-01-10

### ⚠️ Breaking Changes

#### [일정] 속성 지원 완전 제거
- **Notion 페이지 제목만 이벤트 이름으로 사용**
- [일정1~5] 속성은 더 이상 읽지 않음
- 레거시 호환성 코드 모두 제거
- 기존 DB 사용자는 마이그레이션 필요

**영향:**
- 레거시 DB를 사용하는 경우 일정이 표시되지 않습니다
- `npm run migrate`로 새 모델로 전환 필요
- 같은 날짜에 여러 페이지가 있으면 각 페이지 제목이 개별 이벤트로 표시

### ✨ Added

#### Pre-Deploy 체크리스트
- **자동 배포 검증 스크립트** 추가 (`scripts/preDeployCheck.js`)
- Vercel 배포 전 10가지 항목 자동 체크:
  1. Build Script 존재 여부
  2. vercel.json 유효성
  3. 의존성 무결성
  4. 환경 변수 확인
  5. 빌드 크기 제한
  6. ignoreCommand 감지
  7. Git 권한
  8. 캐시 사용량
  9. 빌드 시간 예측
  10. 빌드 출력 검증

#### 새 스크립트 명령어
- `npm run pre-deploy`: 배포 전 체크 실행
- `npm run deploy`: 체크 + Vercel 배포 (자동)

#### 설정 파일
- `.predeployrc`: 프로젝트별 체크 설정
- `.predeployrc.example`: 설정 예제

#### 문서
- `PRE_DEPLOY_GUIDE.md`: 상세한 사용 가이드
- README에 배포 체크리스트 섹션 추가
- CI/CD 통합 예제 (GitHub Actions, GitLab CI)

### 🎯 Features

- **빠른 실행**: < 15초 (일반적으로 < 1초)
- **오프라인 작동**: Vercel API 불필요
- **보안**: 시크릿 로그 출력 안 함
- **색상 출력**: 가독성 향상 (PASS/WARN/FAIL)
- **커스터마이징**: `.predeployrc`로 프로젝트별 설정

### 📚 Documentation

- Pre-deploy 체크 가이드 추가
- CI/CD 통합 예제
- 문제 해결 섹션
- FAQ 추가

### 🐛 Fixed

- 없음 (새 기능 추가)

## Upcoming

### [2.2.0] - Planned
- [ ] Notion DB 필터링 기능
- [ ] 이벤트 색상 커스터마이징
- [ ] 다중 DB 지원
- [ ] 주간/월간 뷰 옵션

### [2.2.0] - Planned
- [ ] 이벤트 클릭 시 상세 모달
- [ ] 반복 이벤트 지원
- [ ] 알림 기능
- [ ] 캘린더 공유 기능

## Support

- 버그 리포트: [GitHub Issues](https://github.com/your-repo/issues)
- 기능 요청: [GitHub Discussions](https://github.com/your-repo/discussions)
- 문서: [README.md](./README.md)

## Links

- [Migration Guide](./MIGRATION_GUIDE.md)
- [README](./README.md)
- [License](./LICENSE)

