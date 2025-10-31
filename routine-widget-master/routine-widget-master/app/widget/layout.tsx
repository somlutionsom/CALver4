import type { Viewport } from 'next'

// 위젯 임베드 전용 viewport 설정 (모바일 노션 앱 호환성)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,  // 모바일 WebView 호환성을 위해 제한 완화
  userScalable: true,
}

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

