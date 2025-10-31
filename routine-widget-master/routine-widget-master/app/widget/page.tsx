'use client'

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
// crypto-js 대신 브라우저 내장 Base64 사용
import Image from 'next/image'
import './widget.css'
import { safeStorage } from '@/lib/safeStorage'

interface WidgetData {
  profileImage: string | null
  sleep: string
  energy: number
  name: string
  mainText: string
}

interface ThemeConfig {
  bg: string
  accent: string
  text: string
  border: string
  secondary: string
  dateColor: string  // 🎯 날짜 폰트 색상
}

type LogEntry = {
  id: string
  timestamp: number
  level: 'info' | 'warn' | 'error'
  message: string
  meta?: Record<string, unknown>
}

const THEME_COLORS: Record<string, ThemeConfig> = {
  pink: {
    bg: 'transparent',
    accent: '#FFB9D9',
    text: '#2C2C2C',
    border: '#FFB9D9',
    secondary: '#FFE5F0',
    dateColor: '#FF85B8'  // 🎯 핑크 (채도↑ 명도↓)
  },
  purple: {
    bg: 'transparent',
    accent: '#D4B5FF',
    text: '#2C2C2C',
    border: '#D4B5FF',
    secondary: '#F0E5FF',  // 🎯 파스텔 퍼플 배경
    dateColor: '#A070FF'   // 🎯 퍼플 (채도↑ 명도↓)
  },
  blue: {
    bg: 'transparent',
    accent: '#B5D4FF',
    text: '#2C2C2C',
    border: '#B5D4FF',
    secondary: '#E5F0FF',  // 🎯 파스텔 블루 배경
    dateColor: '#5AA0FF'   // 🎯 블루 (채도↑ 명도↓)
  },
  mono: {
    bg: 'transparent',
    accent: '#404040',
    text: '#000000',
    border: '#404040',
    secondary: '#E0E0E0',
    dateColor: '#404040'   // 🎯 모노 (기존 accent와 동일)
  }
}

const scheduleWork = (cb: () => void) => {
  if (typeof window === 'undefined') {
    return
  }

  const raf = window.requestAnimationFrame || window.setTimeout
  const idle = (window as any).requestIdleCallback as undefined | ((fn: () => void) => number)

  raf(() => {
    if (idle) {
      idle(cb)
    } else {
      window.setTimeout(cb, 1)
    }
  })
}

const LOG_ENDPOINT = '/api/debug/log'
const MAX_LOG_ENTRIES = 50

const getDebugHeaders = (): Record<string, string> => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return {
      'X-Widget-Viewport': 'unknown',
      'X-Widget-Referrer': 'unknown',
    }
  }

  return {
    'X-Widget-Viewport': `${window.innerWidth}x${window.innerHeight}`,
    'X-Widget-Referrer': document.referrer || 'unknown',
  }
}

const appendLog = (
  logsRef: React.MutableRefObject<LogEntry[]>,
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>,
  entry: Omit<LogEntry, 'id'>
) => {
  // 무한 루프 방지: 로깅 비활성화
  // 디버그가 필요한 경우 이 함수를 다시 활성화
  return
  
  // const id = `${entry.timestamp}-${Math.random().toString(36).slice(2)}`
  // const newEntry: LogEntry = { ...entry, id }
  // logsRef.current = [...logsRef.current.slice(-MAX_LOG_ENTRIES + 1), newEntry]
  // setLogs(logsRef.current)
}

const sendRemoteLog = async (payload: LogEntry) => {
  // 무한 루프 방지: 디버그 로깅 임시 비활성화
  // ERR_CONNECTION_CLOSED 이슈 해결 후 재활성화 예정
  return
  
  // try {
  //   await fetch(LOG_ENDPOINT, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json', ...getDebugHeaders() },
  //     body: JSON.stringify({
  //       log: payload,
  //       userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  //     }),
  //     keepalive: true,
  //   })
  // } catch (err) {
  //   // console.warn 호출 시 무한 루프 발생 가능성 있음
  //   // 에러는 조용히 무시
  // }
}

function WidgetContent() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<WidgetData | null>(null)
  const [config, setConfig] = useState<any>(null)
  const [currentTheme, setCurrentTheme] = useState('pink')
  const [currentTime, setCurrentTime] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [safeAreaInsets, setSafeAreaInsets] = useState({ top: 0, bottom: 0 })
  const abortControllerRef = useRef<AbortController | null>(null)
  const logsRef = useRef<LogEntry[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [debugOverlayVisible, setDebugOverlayVisible] = useState(false)

  useEffect(() => {
    if (logs.length === 0) return

    const latest = logs[logs.length - 1]
    sendRemoteLog(latest)
  }, [logs])

  useEffect(() => {
    const encodedConfig = searchParams.get('config')
    if (encodedConfig) {
      try {
        const base64 = encodedConfig
          .replace(/-/g, '+')
          .replace(/_/g, '/')

        const padding = '='.repeat((4 - (base64.length % 4)) % 4)
        const decodedString = Buffer.from(base64 + padding, 'base64').toString('utf-8')
        const cfg = JSON.parse(decodedString)

        if (!cfg?.token || !cfg?.databaseId) {
          throw new Error('위젯 설정이 올바르지 않습니다')
        }

        appendLog(logsRef, setLogs, {
          timestamp: Date.now(),
          level: 'info',
          message: '위젯 설정 디코딩 성공',
          meta: {
            hasToken: Boolean(cfg.token),
            hasDatabaseId: Boolean(cfg.databaseId),
            theme: cfg.theme,
          },
        })

        setConfig(cfg)
        setCurrentTheme(cfg.theme || 'pink')
        scheduleWork(() => fetchData(cfg))
        safeStorage.setItem('last-config', JSON.stringify(cfg))
      } catch (err: any) {
        console.error('Config decode error:', err)
        setError('설정을 불러올 수 없습니다')
        setLoading(false)
      }
    } else {
      setError('위젯 URL이 올바르지 않습니다')
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    const savedConfig = safeStorage.getItem('last-config')
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig)
        appendLog(logsRef, setLogs, {
          timestamp: Date.now(),
          level: 'info',
          message: '로컬 저장소 설정 복구',
          meta: { theme: parsed.theme },
        })
        setConfig(parsed)
        setCurrentTheme(parsed.theme || 'pink')
        scheduleWork(() => fetchData(parsed))
      } catch (err) {
        console.warn('Saved config parse failed:', err)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 최초 마운트 시에만 실행 (무한 루프 방지)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      // 6. AM/PM 형식으로 표시 (예: 03:06 pm)
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }).toLowerCase()) // pm, am 소문자로
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!config) {
      return
    }

    const interval = window.setInterval(() => {
      fetchData(config)
    }, 300000) // 5분마다 자동 새로고침

    return () => window.clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

  useEffect(() => {
    const updateInsets = () => {
      try {
        const top = Number(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top').replace('px', '')) || 0
        const bottom = Number(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom').replace('px', '')) || 0
        setSafeAreaInsets({ top, bottom })
      } catch (err) {
        // WebView에서 CSS 계산 실패 가능성 대비
        console.warn('Safe area calculation failed:', err)
      }
    }

    if (typeof window === 'undefined') {
      return
    }

    const rafId = window.requestAnimationFrame(updateInsets)
    window.addEventListener('focus', updateInsets, { passive: true })
    window.addEventListener('resize', updateInsets)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('focus', updateInsets)
      window.removeEventListener('resize', updateInsets)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }

    if (typeof (window as any).ResizeObserver === 'undefined') {
      ;(window as any).ResizeObserver = class ResizeObserverPolyfill {
        private intervalId: number | null = null
        private callback: ResizeObserverCallback

        constructor(callback: ResizeObserverCallback) {
          this.callback = callback
        }

        observe() {
          if (this.intervalId !== null) return
          this.intervalId = window.setInterval(() => {
            this.callback([], this as any)
          }, 500)
        }

        unobserve() {
          if (this.intervalId !== null) {
            window.clearInterval(this.intervalId)
            this.intervalId = null
          }
        }

        disconnect() {
          this.unobserve()
        }
      }
    }

    const resizeObserver = new (window as any).ResizeObserver(() => {
      document.documentElement.style.setProperty('--widget-viewport-width', `${window.innerWidth}px`)
      document.documentElement.style.setProperty('--widget-viewport-height', `${window.innerHeight}px`)
      appendLog(logsRef, setLogs, {
        timestamp: Date.now(),
        level: 'info',
        message: '뷰포트 크기 변경',
        meta: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      })
    })

    resizeObserver.observe(document.documentElement)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      appendLog(logsRef, setLogs, {
        timestamp: Date.now(),
        level: 'error',
        message: 'Unhandled promise rejection',
        meta: {
          reason: event.reason instanceof Error ? event.reason.message : String(event.reason),
        },
      })
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  const fetchData = useCallback(async (cfg: any) => {
    setLoading(true)
    setError('')

    try {
      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        headers['X-Widget-Client'] = 'notion-mobile-webview'
      }

      const res = await fetch('/api/notion/widget-data', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          token: cfg.token,
          databaseId: cfg.databaseId
        }),
        credentials: 'include',
        signal: controller.signal,
        referrerPolicy: 'strict-origin-when-cross-origin',
        cache: 'no-store',  // 캐시 비활성화
      })

      if (res.ok) {
        const widgetData = await res.json()
        setData(widgetData)
        appendLog(logsRef, setLogs, {
          timestamp: Date.now(),
          level: 'info',
          message: '데이터 페칭 성공',
          meta: {
            status: res.status,
            hasProfileImage: Boolean(widgetData?.profileImage),
          },
        })
      } else {
        setError('데이터를 불러올 수 없습니다')
        appendLog(logsRef, setLogs, {
          timestamp: Date.now(),
          level: 'warn',
          message: '데이터 페칭 실패',
          meta: {
            status: res.status,
            statusText: res.statusText,
          },
        })
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return
      }
      console.error('Data fetch error:', err)
      setError('네트워크 오류가 발생했습니다')
      appendLog(logsRef, setLogs, {
        timestamp: Date.now(),
        level: 'error',
        message: '데이터 페칭 예외',
        meta: {
          error: err instanceof Error ? err.message : String(err),
        },
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const cycleTheme = useCallback(() => {
    const themes = Object.keys(THEME_COLORS)
    const currentIndex = themes.indexOf(currentTheme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setCurrentTheme(nextTheme)

    if (config) {
      const updated = { ...config, theme: nextTheme }
      setConfig(updated)
      safeStorage.setItem('last-config', JSON.stringify(updated))
    }
  }, [config, currentTheme])

  const theme = useMemo(() => THEME_COLORS[currentTheme], [currentTheme])

  // 테마별 window 배경 이미지 반환 함수
  const getThemedWindow = useCallback(() => {
    const windowMap: Record<string, string> = {
      'pink': 'pink_window.png',
      'purple': 'purple_window.png',
      'blue': 'blue_window.png',
      'mono': 'mono_window.png'
    }
    
    return `/images/${windowMap[currentTheme] || 'window.png'}`
  }, [currentTheme])

  // 테마별 아이콘 경로 반환 함수
  const getThemedIcon = useCallback((iconName: string) => {
    const themePrefix: Record<string, string> = {
      'pink': '',  // 기본 이미지 사용 (battery.png, moon.png)
      'purple': 'purple_',
      'blue': 'blue_',
      'mono': 'black_'
    }
    
    const prefix = themePrefix[currentTheme] || ''
    
    // 아이콘 이름별 파일명 매핑
    const iconMap: Record<string, string> = {
      'battery': prefix ? `${prefix}battery.png` : 'battery.png',
      'moon': prefix ? `${prefix}moon.png` : 'moon.png',
      'bracket-left': prefix ? `${prefix}꺽쇠.png` : 'bracket-left.png',
      'bracket-right': prefix ? `${prefix}꺽쇠2.png` : 'bracket-right.png'
    }
    
    return `/images/${iconMap[iconName] || iconName}`
  }, [currentTheme])

  return (
    <div style={{ 
      minHeight: '100vh', 
      height: '100vh',
      backgroundColor: theme.bg, 
      display: 'flex', 
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: 0,
      margin: 0,
      width: '100%',
      overflow: 'hidden',  // 🎯 스크롤바 완전 제거
      WebkitOverflowScrolling: 'touch',
    }}>
      <div className="widget-scale-wrapper">
        <div 
        className="widget-container"
        onClick={cycleTheme}
        style={{ 
          fontFamily: 'Galmuri7, Galmuri, monospace',
          backgroundImage: `url(${getThemedWindow()})`,
          backgroundSize: '378px 486px',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundColor: 'transparent',
          willChange: 'transform',
        }}
        onTouchStart={() => {
          appendLog(logsRef, setLogs, {
            timestamp: Date.now(),
            level: 'info',
            message: '디버그 오버레이 토글 감지 (touchstart)',
          })
          const timer = window.setTimeout(() => {
            appendLog(logsRef, setLogs, {
              timestamp: Date.now(),
              level: 'info',
              message: '디버그 오버레이 토글',
            })
            setDebugOverlayVisible((prev) => !prev)
          }, 2000)
          safeStorage.setItem('debug-touch-timer', String(timer))
        }}
        onTouchEnd={() => {
          const timer = Number(safeStorage.getItem('debug-touch-timer'))
          if (timer) {
            window.clearTimeout(timer)
            safeStorage.removeItem('debug-touch-timer')
          }
        }}
        onTouchMove={() => {
          const timer = Number(safeStorage.getItem('debug-touch-timer'))
          if (timer) {
            window.clearTimeout(timer)
            safeStorage.removeItem('debug-touch-timer')
          }
        }}
      >
      <div className="widget-inner" role="presentation" aria-hidden={loading}>
        {/* 헤더: profile 텍스트 + X 버튼 */}
        <div className="header-section" data-testid="header">
          <div className="profile-badge" data-testid="profile-badge">
            <span 
              className="profile-text" 
              data-testid="profile-text"
              style={{ 
                color: theme.text,
                backgroundColor: theme.secondary
              }}
            >
              profile
            </span>
            <span 
              className="close-button" 
              data-testid="close-btn"
              style={{ color: theme.accent }}
            >×</span>
        </div>
      </div>
        </div>
        
        {/* 시간 표시 */}
        <div className="time-section" data-testid="time-section">
          <div 
            className="time-badge"
            data-testid="time-badge"
            style={{ 
              backgroundColor: theme.secondary,
              color: theme.text,
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (config) {
                appendLog(logsRef, setLogs, {
                  timestamp: Date.now(),
                  level: 'info',
                  message: '타임 뱃지 클릭 - 새로고침',
                })
                fetchData(config)
              }
            }}
            title="클릭하여 새로고침"
          >
            {currentTime}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="animate-pulse" role="status" aria-live="polite">
              <div className="text-4xl" aria-hidden="true">⏳</div>
              <p style={{ color: theme.text, marginTop: '8px', fontSize: '14px' }}>데이터 로딩 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="error-state" role="alert">
            <div>
              <div className="text-4xl" aria-hidden="true">⚠️</div>
              <p className="text-sm" style={{ color: theme.text, marginTop: '8px' }}>{error}</p>
              <p style={{ color: theme.text, marginTop: '4px', fontSize: '10px' }}>
                모바일 앱에서 이 메시지가 보인다면 설정을 확인해주세요
              </p>
            </div>
          </div>
        ) : data ? (
          <>
            {/* 프로필 이미지 + 스탯(에너지/수면) 영역 */}
            <div className="profile-stats-section" data-testid="profile-stats">
              {/* 프로필 이미지 */}
              <div className="profile-image-wrapper" data-testid="profile-image">
                {data.profileImage ? (
                  <Image 
                    src={data.profileImage} 
                    alt="Profile"
                    width={176}
                    height={176}
                    style={{ 
                      imageRendering: 'pixelated',
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%'
                    }}
                    unoptimized
                  />
                ) : (
                  <Image 
                    src="/images/default-profile.png" 
                    alt="Default Profile"
                    width={176}
                    height={176}
                    style={{ 
                      imageRendering: 'pixelated',
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                )}
              </div>

              {/* 스탯: 에너지/수면 */}
              <div className="stats-wrapper" data-testid="stats">
                {/* 에너지 */}
                <div className="energy-stat" data-testid="energy">
                  <Image 
                    src={getThemedIcon('battery')}
                    alt="Energy"
                    width={24}
                    height={24}
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <span className="stat-value" data-testid="energy-value" style={{ color: theme.text }}>
                    {data.energy > 0 ? `${Math.round(data.energy * 20)}%` : '기록하기'}
                  </span>
                </div>
                {/* 수면시간 */}
                <div className="sleep-stat" data-testid="sleep">
                  <Image 
                    src={getThemedIcon('moon')}
                    alt="Sleep"
                    width={24}
                    height={24}
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <span className="stat-value" data-testid="sleep-value" style={{ color: theme.text }}>
                    {data.sleep || '기록하기'}
                  </span>
                </div>
              </div>
            </div>

            {/* 메시지 박스 + 닉네임 + 날짜 전체 영역 */}
            <div className="message-name-section" data-testid="message-section">
              {/* 메인 텍스트 박스 (꺽쇠 포함) */}
              <div className="message-box-wrapper" data-testid="message-box">
                {/* 메시지 내용 */}
                <div 
                  className="message-content"
                  data-testid="message-content"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: `4px solid ${theme.border}`,
                    minHeight: '92px'
                  }}
                >
                  {/* 왼쪽 꺽쇠 (텍스트 박스 안에) */}
                  <Image 
                    src={getThemedIcon('bracket-left')}
                    alt=""
                    width={10}
                    height={10}
                    className="bracket-left"
                    data-testid="bracket-left"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <p className="message-text" data-testid="message-text" style={{ color: theme.text }}>
                    {data.mainText || '오늘도 화이팅! 💪'}
                  </p>
                  {/* 오른쪽 꺽쇠 (텍스트 박스 안에) */}
                  <Image 
                    src={getThemedIcon('bracket-right')}
                    alt=""
                    width={10}
                    height={10}
                    className="bracket-right"
                    data-testid="bracket-right"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              </div>
              
              {/* 닉네임 */}
              <div className="name-wrapper" data-testid="name-wrapper">
                <div 
                  className="name-badge"
                  data-testid="name-badge"
                  style={{ 
                    backgroundColor: theme.accent,
                  }}
                >
                  {data.name || 'som'}
                </div>
              </div>
              
              {/* 하트 아이콘 */}
              <div className="hearts-wrapper" data-testid="hearts-wrapper">
                <div className="hearts-group" data-testid="hearts">
                  <Image 
                    src="/images/hearts.png"
                    alt="hearts"
                    width={35}
                    height={18}
                    data-testid="hearts"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              </div>
              
            </div>
            
            {/* 브랜드 워터마크 */}
            <div style={{
              width: '100%',
              textAlign: 'center',
              marginTop: '-2px',
              fontSize: '7px',
              fontWeight: 'bold',
              letterSpacing: '1.5px',
              opacity: 0.2,
              color: theme.text,
              userSelect: 'none',
              pointerEvents: 'none'
            }}>
              SOMLUTUON
            </div>

            {/* 새로고침 버튼 (숨김) */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (config) fetchData(config)
              }}
              className="refresh-button"
              style={{ 
                backgroundColor: theme.accent,
                color: 'white'
              }}
            >
              🔄
            </button>
          </>
        ) : null}
        </div>
      </div>
      {debugOverlayVisible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            maxHeight: '50vh',
            overflowY: 'auto',
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: '10px',
            zIndex: 9999,
            padding: '8px',
          }}
          onClick={() => setDebugOverlayVisible(false)}
        >
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
            Debug Overlay (tap to close)
          </div>
          <div style={{ marginBottom: '8px' }}>
            UA: {typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'}
          </div>
          <div style={{ marginBottom: '8px' }}>
            Viewport: {typeof window !== 'undefined' ? `${window.innerWidth}×${window.innerHeight}` : 'server'}
          </div>
          {logs.map((log) => (
            <div key={log.id} style={{ marginBottom: '4px' }}>
              <span>[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
              <span>{log.level.toUpperCase()}</span>{' '}
              <span>{log.message}</span>
              {log.meta && (
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(log.meta, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function WidgetPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#FFCEE4',
        fontSize: '24px'
      }}>
        ⏳ 위젯 로딩 중...
      </div>
    }>
      <WidgetContent />
    </Suspense>
  )
}

