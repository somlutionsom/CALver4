export default function WidgetTest() {
  const steps = [
    '노션 모바일 앱에서 이 페이지를 열고 스크롤이 가능한지 확인하세요.',
    '디버그 오버레이를 열려면 2초 이상 길게 눌러 로그가 표시되는지 확인하세요.',
    '오버레이에 UA, viewport 정보가 포함되는지 확인하세요.',
    '하단 버튼을 통해 위젯 화면으로 이동하고, 다시 돌아와 동작을 비교하세요.',
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FFCEE4',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        fontSize: '16px',
        padding: '24px 16px',
        textAlign: 'left',
        fontFamily: "'NeoDonggeunmo', 'DotGothic16', monospace",
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          border: '2px solid #FFB9D9',
          padding: '24px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '12px', textAlign: 'center' }}>🧪</div>
        <h1 style={{ fontSize: '20px', marginBottom: '16px', textAlign: 'center', color: '#2C2C2C' }}>
          Notion 모바일 앱 셀프 테스트 체크리스트
        </h1>

        <ol style={{ paddingLeft: '20px', marginBottom: '24px', color: '#2C2C2C' }}>
          {steps.map((step, index) => (
            <li key={index} style={{ marginBottom: '12px', lineHeight: 1.6 }}>
              {step}
            </li>
          ))}
        </ol>

        <div style={{ marginBottom: '16px', color: '#2C2C2C' }}>
          <strong>현재 환경 정보</strong>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px' }}>
            <li>UA: <code>{typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'}</code></li>
            <li>
              Viewport:{' '}
              <code>
                {typeof window !== 'undefined'
                  ? `${window.innerWidth} × ${window.innerHeight}`
                  : 'server'}
              </code>
            </li>
          </ul>
        </div>

        <div
          style={{
            backgroundColor: '#FFF4FA',
            border: '1px dashed #FFB9D9',
            borderRadius: '12px',
            padding: '16px',
            color: '#5F3A48',
            marginBottom: '24px',
          }}
        >
          <strong>📌 참고:</strong>
          <ul style={{ marginTop: '8px', paddingLeft: '18px' }}>
            <li>오버레이 로그는 `/api/debug/log` 엔드포인트로 전송됩니다.</li>
            <li>UA/Viewport, referrer, 상태 정보가 함께 기록됩니다.</li>
            <li>문제가 발생하면 오버레이 화면을 캡처하여 공유하세요.</li>
          </ul>
        </div>

        <a
          href="/widget"
          style={{
            display: 'block',
            textAlign: 'center',
            backgroundColor: '#FFB9D9',
            color: '#2C2C2C',
            padding: '12px 16px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          위젯 화면 열기 →
        </a>
      </div>
    </div>
  )
}
