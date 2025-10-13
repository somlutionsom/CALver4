# DB 구조 마이그레이션 가이드

## 개요

이 가이드는 Notion Calendar DB 구조를 **레거시 모델**에서 **새 모델**로 변경하는 방법을 설명합니다.

## 변경 내용

### 이전 (레거시 모델)
- **구조**: 1개 페이지 = 1개 날짜
- **속성**:
  - 날짜 (Date)
  - 제목 (Title)
  - 일정1 (Rich Text)
  - 일정2 (Rich Text)
  - 일정3 (Rich Text)
  - 일정4 (Rich Text)
  - 일정5 (Rich Text)
  - 중요 (Select/Checkbox)

### 이후 (새 모델) ✨
- **구조**: 1개 페이지 = 1개 이벤트
- **속성**:
  - 날짜 (Date)
  - 제목 (Title) - 이벤트 이름
  - 중요 (Select/Checkbox)

## 장점

### 새 모델의 이점

1. **무제한 이벤트**: 하루에 5개 이상의 일정도 지원
2. **더 간단한 구조**: 일정1~5 속성 불필요
3. **Notion 네이티브**: Notion의 페이지 기반 구조와 일치
4. **더 나은 확장성**: 각 이벤트에 추가 속성 쉽게 추가 가능
5. **개별 페이지 링크**: 각 이벤트에 직접 링크 가능

### 레거시 모델의 한계

- ❌ 하루 최대 5개 일정만 지원
- ❌ 복잡한 속성 구조
- ❌ 확장성 제한

## 중요 변경 사항 ⚠️

### v2.1.0부터 변경된 동작

**이제 앱은 Notion 페이지 제목만 사용합니다:**
- ✅ 페이지 제목 = 이벤트 이름
- ❌ [일정1~5] 속성은 **완전히 무시됨**
- ❌ 레거시 호환성 제거됨

### 기존 사용자 영향

기존 레거시 DB(일정1~5 속성 사용)를 사용하는 경우:
- ⚠️ **일정 속성이 표시되지 않습니다**
- ⚠️ **페이지 제목만 표시됩니다**
- ✅ 마이그레이션 스크립트를 사용하여 새 모델로 전환하세요

## 마이그레이션 방법

### 옵션 1: 새 DB 생성 (권장)

1. Notion에서 새 데이터베이스 생성
2. 속성 설정:
   - 날짜 (Date 타입)
   - 제목 (Title 타입)
   - 중요 (Select 타입, 옵션: "중요")
3. 새 DB ID로 위젯 설정

### 옵션 2: 자동 마이그레이션 스크립트

#### 준비
```bash
npm install
```

#### 환경 변수 설정
```bash
# Linux/Mac
export NOTION_API_KEY="secret_xxxxxxxxxxxxx"
export SOURCE_DATABASE_ID="abc123..."
export TARGET_DATABASE_ID="xyz789..."  # 선택사항

# Windows PowerShell
$env:NOTION_API_KEY="secret_xxxxxxxxxxxxx"
$env:SOURCE_DATABASE_ID="abc123..."
$env:TARGET_DATABASE_ID="xyz789..."
```

#### 실행
```bash
npm run migrate
```

#### 프로세스
1. ✅ Dry Run으로 계획 확인
2. ✅ 사용자 확인 프롬프트
3. ✅ 각 일정을 개별 페이지로 생성
4. ✅ 통계 및 결과 보고

### 옵션 3: 수동 마이그레이션

기존 페이지가 적다면:
1. 새 DB 생성
2. 각 일정을 수동으로 새 페이지로 복사
3. 날짜와 제목 설정

## 마이그레이션 예시

### Before (레거시)
```
📄 2024-01-15 업무일정
   ├─ 일정1: 팀 회의
   ├─ 일정2: 프로젝트 발표
   └─ 일정3: 보고서 작성
```

### After (새 모델)
```
📄 2024-01-15 팀 회의
📄 2024-01-15 프로젝트 발표
📄 2024-01-15 보고서 작성
```

## 주의사항

⚠️ **중요 사항:**
- 마이그레이션은 **새 페이지만 생성**하고 기존 페이지는 삭제하지 않습니다
- 마이그레이션 후 **데이터를 확인**하고 문제 없으면 기존 페이지를 **수동으로 삭제**하세요
- Notion API 요청 제한: **3 req/sec**
- 대용량 DB는 시간이 걸릴 수 있습니다
- **백업을 권장**합니다

## API 변경사항

### 타입 정의 변경

#### CalendarEvent
```typescript
// 이전
interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  schedules: string[];  // 필수
  isImportant: boolean;
  pageUrl: string;
}

// 이후
interface CalendarEvent {
  id: string;
  date: string;
  title: string;  // 이벤트 이름
  schedules?: string[];  // 선택사항 (레거시 호환)
  isImportant: boolean;
  pageUrl: string;
}
```

#### NotionConfig
```typescript
// 이전
interface NotionConfig {
  databaseId: string;
  apiKey: string;
  dateProperty: string;
  titleProperty: string;
  scheduleProperties: string[];  // 필수
  importantProperty: string;
}

// 이후
interface NotionConfig {
  databaseId: string;
  apiKey: string;
  dateProperty: string;
  titleProperty: string;
  scheduleProperties?: string[];  // 선택사항
  importantProperty: string;
}
```

## UI 변경사항

### 캘린더 툴팁

#### 레거시 모델
- 하나의 이벤트 객체에서 `schedules` 배열 표시
- 예: ["팀 회의", "프로젝트 발표"]

#### 새 모델
- 여러 이벤트 객체의 `title` 표시
- 각 이벤트가 개별 페이지
- 예: [Event{title: "팀 회의"}, Event{title: "프로젝트 발표"}]

## 롤백

새 모델이 맞지 않는다면:
1. 기존 DB를 계속 사용 (자동으로 레거시 모드)
2. 또는 새로 생성한 페이지를 삭제

## FAQ

### Q: 기존 DB를 계속 사용할 수 있나요?
**A:** 네! 레거시 모델은 계속 지원됩니다.

### Q: 마이그레이션 후 기존 페이지를 삭제해야 하나요?
**A:** 네, 마이그레이션은 새 페이지만 생성하므로 검증 후 수동으로 삭제해야 합니다.

### Q: 하루에 5개 이상 일정이 있으면?
**A:** 새 모델을 사용하세요. 무제한 이벤트를 지원합니다.

### Q: API 키가 그대로 작동하나요?
**A:** 네, 동일한 API 키를 사용합니다.

### Q: 마이그레이션 시간은 얼마나 걸리나요?
**A:** DB 크기에 따라 다릅니다. Notion API 제한(3 req/sec)으로 인해 100개 페이지당 약 1-2분 소요됩니다.

### Q: 마이그레이션 중 오류가 발생하면?
**A:** 스크립트는 기존 데이터를 삭제하지 않으므로 안전합니다. 오류 로그를 확인하고 다시 시도하세요.

## 지원

문제가 있으면:
1. [GitHub Issues](https://github.com/your-repo/issues) 생성
2. 오류 로그 포함
3. DB 구조 스크린샷 첨부 (민감 정보 제거)

## 체크리스트

마이그레이션 전:
- [ ] Notion API 키 준비
- [ ] DB ID 확인
- [ ] DB 백업 (선택사항)
- [ ] 새 DB 생성 (또는 기존 DB 사용)

마이그레이션 중:
- [ ] 환경 변수 설정
- [ ] `npm run migrate` 실행
- [ ] Dry Run 결과 확인
- [ ] 실제 마이그레이션 실행

마이그레이션 후:
- [ ] 새 DB에서 데이터 확인
- [ ] 위젯에서 이벤트 표시 확인
- [ ] 기존 페이지 삭제 (검증 후)
- [ ] 위젯 설정 업데이트 (필요시)

## 버전 정보

- **v1.0**: 레거시 모델 (1페이지=1날짜)
- **v2.0**: 새 모델 지원 + 하위 호환성

---

마이그레이션에 성공하셨나요? 🎉
피드백을 남겨주세요!

