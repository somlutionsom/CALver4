# 🎨 위젯 CSS 조절 가이드

모든 스타일이 순수 CSS로 변환되었습니다! 이제 개발자 도구에서 쉽게 조절할 수 있어요.

## 📁 파일 위치
- **CSS 파일**: `app/widget/widget.css`
- **컴포넌트 파일**: `app/widget/page.tsx`

## 🎯 각 영역별 조절 방법

### 1️⃣ Profile 영역 (profile 텍스트 + X 버튼)
**CSS 클래스**: `.header-section`, `.profile-badge`, `.profile-text`, `.close-button`

| 항목 | CSS 속성 | 설명 |
|------|---------|------|
| Profile 위치 | `.profile-badge { margin-left: 8px; }` | 우측 이동 (값 증가 = 더 우측) |
| Profile 배경 패딩 | `.profile-text { padding: 4px 12px; }` | 상하/좌우 여백 |
| Profile 라운드 | `.profile-text { border-radius: 8px; }` | 값 증가 = 더 둥글게 |
| Profile 폰트 크기 | `.profile-text { font-size: 12px; }` | 글자 크기 |
| X 버튼 크기 | `.close-button { font-size: 18px; }` | X 크기 |

**배경색 변경**: `app/widget/page.tsx` 198줄 `backgroundColor: '#FFE5F0'`

---

### 2️⃣ 시계 영역
**CSS 클래스**: `.time-section`, `.time-badge`

| 항목 | CSS 속성 | 설명 |
|------|---------|------|
| 시계 위치 (상하) | `.time-section { margin-bottom: 16px; }` | 아래 여백 |
| 시계 위치 (좌우) | `.time-section { margin-right: 8px; }` | 우측 여백 |
| 시계 배경 패딩 | `.time-badge { padding: 4px 16px; }` | 상하/좌우 여백 |
| 시계 라운드 | `.time-badge { border-radius: 6px; }` | 값 감소 = 더 각지게 |
| 시계 폰트 크기 | `.time-badge { font-size: 12px; }` | 글자 크기 |

**배경색 변경**: `app/widget/page.tsx` 194줄 `backgroundColor: '#FFE5F0'`

---

### 3️⃣ 배터리/달 아이콘 + 수치 영역
**CSS 클래스**: `.stats-wrapper`, `.energy-stat`, `.sleep-stat`, `.stat-value`

| 항목 | CSS 속성 | 설명 |
|------|---------|------|
| 전체 위치 (좌우) | `.stats-wrapper { margin-left: 16px; }` | 우측 이동 |
| 전체 위치 (상하) | `.stats-wrapper { margin-top: 8px; }` | 아래 이동 |
| 에너지/수면 간격 | `.stats-wrapper { gap: 16px; }` | 세로 간격 |
| 아이콘-수치 간격 | `.energy-stat, .sleep-stat { gap: 8px; }` | 가로 간격 |
| 수치 폰트 크기 | `.stat-value { font-size: 16px; }` | 숫자 크기 |

**아이콘 크기 변경**: `app/widget/page.tsx` 253, 267줄 `width={24} height={24}`

---

### 4️⃣ 메인 텍스트 박스 영역
**CSS 클래스**: `.message-content`, `.message-text`

| 항목 | CSS 속성 | 설명 |
|------|---------|------|
| 박스 라운드 | `.message-content { border-radius: 8px; }` | 값 감소 = 더 각지게 |
| 박스 내부 패딩 | `.message-content { padding: 12px; }` | 내용물 여백 |
| 박스 최소 높이 | `.message-content { min-height: 80px; }` | 세로 크기 |
| 텍스트 폰트 크기 | `.message-text { font-size: 14px; }` | 글자 크기 |
| 텍스트 줄 간격 | `.message-text { line-height: 1.625; }` | 줄 간격 |

**보더 두께 변경**: `app/widget/page.tsx` 297줄 `border: 4px solid ${theme.border}`

---

### 5️⃣ 꺽쇠 (bracket)
**CSS 클래스**: `.bracket-left`, `.bracket-right`

| 항목 | CSS 속성 | 설명 |
|------|---------|------|
| 꺽쇠-박스 간격 | `.message-box-wrapper { gap: 4px; }` | 간격 조절 |

**꺽쇠 크기 변경**: `app/widget/page.tsx` 285, 309줄 `width={10} height={10}`

---

### 6️⃣ 닉네임 영역
**CSS 클래스**: `.name-hearts-wrapper`, `.name-badge`

| 항목 | CSS 속성 | 설명 |
|------|---------|------|
| 닉네임 위치 (상하) | `.name-hearts-wrapper { bottom: -12px; }` | 음수 = 아래로 |
| 닉네임 위치 (좌우) | `.name-hearts-wrapper { right: 24px; }` | 값 감소 = 더 우측 |
| 닉네임 배경 패딩 | `.name-badge { padding: 8px 24px; }` | 상하/좌우 여백 |
| 닉네임 폰트 크기 | `.name-badge { font-size: 14px; }` | 글자 크기 |
| 닉네임-하트 간격 | `.name-hearts-wrapper { gap: 8px; }` | 간격 |

**배경색 변경**: `app/widget/page.tsx` 324줄 `backgroundColor: '#FFD1E3'`

---

### 7️⃣ 날짜 영역
**CSS 클래스**: `.date-display`, `.date-text`

| 항목 | CSS 속성 | 설명 |
|------|---------|------|
| 날짜 위치 (상하) | `.date-display { top: -24px; }` | 음수 = 위로 |
| 날짜 위치 (좌우) | `.date-display { right: 24px; }` | 값 감소 = 더 우측 |
| 날짜 폰트 크기 | `.date-text { font-size: 12px; }` | 글자 크기 |

---

### 8️⃣ 하트 아이콘
**CSS 클래스**: `.hearts-group`

| 항목 | CSS 속성 | 설명 |
|------|---------|------|
| 하트 간격 | `.hearts-group { gap: 4px; }` | 2개 하트 사이 간격 |

**하트 크기 변경**: `app/widget/page.tsx` 335, 343줄 `width={16} height={16}`

---

## 🛠️ 개발자 도구 사용법

### 1. Elements 탭에서 찾기
```
F12 → Elements → Ctrl+F → data-testid 검색
```

### 2. 주요 data-testid
- `header` - 헤더 전체
- `profile-badge` - Profile 영역
- `profile-text` - Profile 텍스트
- `close-btn` - X 버튼
- `time-section` - 시계 전체
- `time-badge` - 시계 배경
- `stats` - 스탯 전체 (에너지+수면)
- `energy` - 에너지 영역
- `energy-value` - 에너지 수치
- `sleep` - 수면 영역
- `sleep-value` - 수면 수치
- `message-box` - 메시지 박스 전체
- `message-content` - 메시지 내용
- `message-text` - 메시지 텍스트
- `bracket-left` - 왼쪽 꺽쇠
- `bracket-right` - 오른쪽 꺽쇠
- `name-hearts` - 닉네임+하트 전체
- `name-badge` - 닉네임 배경
- `hearts` - 하트 그룹
- `date` - 날짜 전체
- `date-text` - 날짜 텍스트

### 3. 실시간 조절 후 적용
1. **Elements**에서 요소 선택
2. **Styles** 탭에서 값 수정
3. 만족스러우면 → CSS 파일에 반영

---

## 📝 이미지 크기 조절 위치

### `app/widget/page.tsx` 파일에서:
- **프로필 이미지**: 226, 237줄 `width={160} height={160}`
- **배터리 아이콘**: 253줄 `width={24} height={24}`
- **달 아이콘**: 267줄 `width={24} height={24}`
- **왼쪽 꺽쇠**: 285줄 `width={10} height={10}`
- **오른쪽 꺽쇠**: 309줄 `width={10} height={10}`
- **하트 (2개)**: 335, 343줄 `width={16} height={16}`

---

## 🎨 색상 변경 (Inline Styles)

### `app/widget/page.tsx` 파일에서:
- **Profile 배경**: 183줄 `backgroundColor: '#FFE5F0'`
- **시계 배경**: 194줄 `backgroundColor: '#FFE5F0'`
- **닉네임 배경**: 324줄 `backgroundColor: '#FFD1E3'`
- **메시지 박스 배경**: 296줄 `backgroundColor: 'rgba(255, 255, 255, 0.9)'`

---

## 💡 팁

1. **CSS 파일 우선**: 대부분의 스타일은 `widget.css`에서 조절
2. **이미지 크기**: `page.tsx`의 Image 컴포넌트에서 조절
3. **색상**: `page.tsx`의 inline style에서 조절
4. **빠른 찾기**: `data-testid`로 검색하면 즉시 찾을 수 있어요!

---

**만든 날짜**: 2025년 (CSS 변환 완료)

