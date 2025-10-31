import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Notion Pixel Widget',
  description: '노션과 연동되는 귀여운 픽셀 위젯',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=DotGothic16&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
