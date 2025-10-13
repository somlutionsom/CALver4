/**
 * 전역 타입 정의
 * PM/UX: 사용자 경험을 위한 명확한 데이터 구조
 * FE 리드: TypeScript 엄격 모드 준수
 */

// Notion 관련 타입
export interface NotionConfig {
  databaseId: string;
  apiKey: string;
  dateProperty: string;
  titleProperty: string;
  scheduleProperties?: string[]; // 자동 감지용 (사용 안 함)
  importantProperty: string; // 중요 Select 속성
}

// 캘린더 이벤트 타입
// 1개 페이지 = 1개 이벤트 (페이지 제목이 이벤트 이름)
export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string; // 이벤트 이름 (Notion 페이지 제목)
  isImportant: boolean;
  pageUrl: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// 위젯 설정 타입
export interface WidgetConfig {
  id: string;
  notionConfig: NotionConfig;
  theme?: ThemeConfig;
  createdAt: string;
  updatedAt: string;
}

// 테마 설정
export interface ThemeConfig {
  primaryColor?: string;
  accentColor?: string; // 레거시 호환성 (사용 안 함)
  importantColor?: string;
  backgroundColor?: string;
  backgroundOpacity?: number; // 0-100
  fontFamily?: string;
}

// 캘린더 뷰 타입
export interface CalendarView {
  year: number;
  month: number;
  events: Map<string, CalendarEvent[]>;
}

// 날짜 관련 유틸리티 타입
export interface DateInfo {
  date: Date;
  dateString: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  events: CalendarEvent[];
}

// Result 타입 (에러 핸들링용)
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// 환경 설정 타입
export interface EnvConfig {
  NOTION_API_VERSION: string;
  ENCRYPTION_KEY: string;
  NODE_ENV: 'development' | 'production' | 'test';
  VERCEL_URL?: string;
}

