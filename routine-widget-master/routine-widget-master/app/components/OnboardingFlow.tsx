'use client'

import { useState } from 'react'
// crypto-js 대신 브라우저 내장 Base64 사용


interface Routine {
  name: string
  duration: number
  emoji: string
}

interface OnboardingFlowProps {
  onComplete: (profileUrl: string, dialogueUrl: string, routineUrl: string, config: any) => void
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1)
  const [apiToken, setApiToken] = useState('')
  const [databases, setDatabases] = useState<any[]>([])
  const [selectedDb, setSelectedDb] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [widgetUrls, setWidgetUrls] = useState({ profile: '', dialogue: '', routine: '' })
  const [routines, setRoutines] = useState<Routine[]>([
    { name: '일기 쓰기', duration: 5, emoji: '📖' },
    { name: '명상', duration: 10, emoji: '❤️' }
  ])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // 미리보기 업데이트 함수
  const updatePreview = (dbId?: string) => {
    if (step >= 2) {
      const previewConfig = {
        token: apiToken,
        databaseId: dbId || selectedDb,
        theme: 'pink', // 기본 핑크 테마로 고정
        isPreview: true
      }
      
      // UTF-8 → Base64 (URL-safe)
      const jsonString = JSON.stringify(previewConfig);
      const encoder = new TextEncoder();
      const bytes = encoder.encode(jsonString);
      let base64 = btoa(String.fromCharCode(...bytes));
      base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      
      // Routine config 추가
      const routineConfig = {
        ...previewConfig,
        routines
      }
      const routineJsonString = JSON.stringify(routineConfig);
      const routineBytes = new TextEncoder().encode(routineJsonString);
      let routineBase64 = btoa(String.fromCharCode(...routineBytes));
      routineBase64 = routineBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      
      // 3개 위젯 URL 생성
      const profileUrl = `${window.location.origin}/widget?config=${base64}`
      const dialogueUrl = `${window.location.origin}/widget-dialogue?config=${base64}`
      const routineUrl = `${window.location.origin}/widget-routine?config=${routineBase64}`
      
      onComplete(profileUrl, dialogueUrl, routineUrl, previewConfig)
    }
  }

  const connectNotion = async () => {
    if (!apiToken.startsWith('ntn_')) {
      setError('올바른 Notion API 토큰을 입력해주세요 (ntn_로 시작)')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/notion/databases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: apiToken })
      })
      
      if (res.ok) {
        const data = await res.json()
        setDatabases(data.databases)
        setStep(2)
        // Step 2로 이동 후 기본 테마로 미리보기 표시
        setTimeout(() => updatePreview(), 100)
      } else {
        setError('데이터베이스를 불러올 수 없습니다. 토큰을 확인해주세요.')
      }
    } catch (err: any) {
      setError('연결 실패: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const generateWidget = () => {
    const config = {
      token: apiToken,
      databaseId: selectedDb,
      theme: 'pink' // 기본 핑크 테마로 고정
    }
    
    // UTF-8 → Base64 (URL-safe)
    const jsonString = JSON.stringify(config);
    const encoder = new TextEncoder();
    const bytes = encoder.encode(jsonString);
    let base64 = btoa(String.fromCharCode(...bytes));
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    // Routine config (루틴 정보 포함)
    const routineConfig = {
      ...config,
      routines
    }
    const routineJsonString = JSON.stringify(routineConfig);
    const routineBytes = new TextEncoder().encode(routineJsonString);
    let routineBase64 = btoa(String.fromCharCode(...routineBytes));
    routineBase64 = routineBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    // 3개 위젯 URL 생성
    const profileUrl = `${window.location.origin}/widget?config=${base64}`
    const dialogueUrl = `${window.location.origin}/widget-dialogue?config=${base64}`
    const routineUrl = `${window.location.origin}/widget-routine?config=${routineBase64}`
    
    setWidgetUrls({ profile: profileUrl, dialogue: dialogueUrl, routine: routineUrl })
    onComplete(profileUrl, dialogueUrl, routineUrl, config)
    setStep(3)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('URL이 복사되었습니다!')
  }

  return (
    <div className="bg-white rounded-lg p-6 window-frame" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div className="border-b-2 border-gray-200 pb-2 mb-4">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-dark">
            Step 1: Notion 연결하기
          </h2>
          <p className="text-sm text-gray-600">
            Notion Integration Token을 입력해주세요
          </p>
          
          <div className="space-y-2">
            <input
              type="password"
              value={apiToken}
              onChange={(e) => {
                setApiToken(e.target.value)
                setError('')
              }}
              placeholder="ntn_..."
              className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:border-pink-medium transition-colors"
            />
            
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>

          <div className="bg-gray-100 p-3 rounded-md text-xs">
            <p className="font-bold mb-1">💡 Tip:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>notion.so/my-integrations 에서 Integration 생성</li>
              <li>Read content 권한 부여</li>
              <li>Secret token 복사</li>
            </ol>
          </div>

          <button
            onClick={connectNotion}
            disabled={loading || !apiToken}
            className="w-full bg-pink-medium text-white p-3 rounded-md pixel-button hover:bg-pink-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '연결중...' : '연결하기'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-dark">
            Step 2: 위젯 설정하기
          </h2>
          
          <div>
            <label className="block text-sm font-bold mb-2">
              📊 데이터베이스 선택
            </label>
            <select
              value={selectedDb}
              onChange={(e) => {
                setSelectedDb(e.target.value)
                if (e.target.value) {
                  updatePreview(e.target.value)
                }
              }}
              className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:border-pink-medium transition-colors"
            >
              <option value="">선택하세요</option>
              {databases.map((db: any) => (
                <option key={db.id} value={db.id}>
                  {db.title[0]?.plain_text || 'Untitled Database'}
                </option>
              ))}
            </select>
          </div>

          {/* 루틴 입력 섹션 */}
          <div>
            <label className="block text-sm font-bold mb-2">
              🎮 루틴 설정 (Routine Player용)
            </label>
            
            <div className="space-y-2">
              {routines.map((routine, index) => (
                <div 
                  key={index} 
                  className={`flex gap-2 items-center ${draggedIndex === index ? 'opacity-50' : ''}`}
                  draggable
                  onDragStart={() => setDraggedIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (draggedIndex !== null && draggedIndex !== index) {
                      const updated = [...routines]
                      const [removed] = updated.splice(draggedIndex, 1)
                      updated.splice(index, 0, removed)
                      setRoutines(updated)
                    }
                    setDraggedIndex(null)
                  }}
                  onDragEnd={() => setDraggedIndex(null)}
                >
                  <div className="cursor-move text-gray-400 hover:text-gray-600">
                    ⋮⋮
                  </div>
                  <input
                    type="text"
                    value={routine.emoji}
                    onChange={(e) => {
                      const updated = [...routines]
                      updated[index].emoji = e.target.value
                      setRoutines(updated)
                    }}
                    className="w-12 p-2 border-2 border-gray-300 rounded-md text-center"
                    placeholder="🎯"
                  />
                  <input
                    type="text"
                    value={routine.name}
                    onChange={(e) => {
                      const updated = [...routines]
                      updated[index].name = e.target.value
                      setRoutines(updated)
                    }}
                    className="flex-1 p-2 border-2 border-gray-300 rounded-md"
                    placeholder="루틴 이름"
                  />
                  <input
                    type="number"
                    value={routine.duration}
                    onChange={(e) => {
                      const updated = [...routines]
                      updated[index].duration = Number(e.target.value)
                      setRoutines(updated)
                    }}
                    className="w-16 p-2 border-2 border-gray-300 rounded-md text-center"
                    placeholder="분"
                    min="1"
                  />
                  <button
                    onClick={() => {
                      const updated = routines.filter((_, i) => i !== index)
                      setRoutines(updated)
                    }}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                  >
                    -
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => {
                  setRoutines([...routines, { name: '', duration: 0, emoji: '' }])
                }}
                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-pink-medium hover:text-pink-medium transition-colors"
              >
                + 루틴 추가
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-200 text-gray-dark p-3 rounded-md pixel-button hover:bg-gray-300 transition-colors"
            >
              ← 이전
            </button>
            <button
              onClick={generateWidget}
              disabled={!selectedDb}
              className="flex-1 bg-pink-medium text-white p-3 rounded-md pixel-button hover:bg-pink-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              위젯 생성하기
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-dark">
              위젯 생성 완료!
            </h2>
            <p className="text-sm text-gray-600 mt-2">3개의 위젯이 생성되었습니다</p>
          </div>

          {/* 프로필 위젯 URL */}
          <div className="border-2 border-pink-200 bg-pink-50 p-4 rounded-lg">
            <label className="block text-sm font-bold mb-2 text-pink-600">
              🎮 1. 프로필 위젯
            </label>
            <div className="bg-white p-3 rounded-md break-all mb-3">
              <code className="text-xs">{widgetUrls.profile}</code>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(widgetUrls.profile)}
                className="flex-1 bg-pink-500 text-white p-2 rounded-md pixel-button hover:bg-pink-600 transition-colors text-sm"
              >
                📋 복사
              </button>
              <button
                onClick={() => window.open(widgetUrls.profile, '_blank', 'width=370,height=470')}
                className="flex-1 bg-pink-400 text-white p-2 rounded-md pixel-button hover:bg-pink-500 transition-colors text-sm"
              >
                🔗 열기
              </button>
            </div>
          </div>

          {/* 칭찬 위젯 URL */}
          <div className="border-2 border-purple-200 bg-purple-50 p-4 rounded-lg">
            <label className="block text-sm font-bold mb-2 text-purple-600">
              💬 2. 칭찬 위젯
            </label>
            <div className="bg-white p-3 rounded-md break-all mb-3">
              <code className="text-xs">{widgetUrls.dialogue}</code>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(widgetUrls.dialogue)}
                className="flex-1 bg-purple-500 text-white p-2 rounded-md pixel-button hover:bg-purple-600 transition-colors text-sm"
              >
                📋 복사
              </button>
              <button
                onClick={() => window.open(widgetUrls.dialogue, '_blank', 'width=300,height=130')}
                className="flex-1 bg-purple-400 text-white p-2 rounded-md pixel-button hover:bg-purple-500 transition-colors text-sm"
              >
                🔗 열기
              </button>
            </div>
          </div>

          {/* 루틴 플레이어 위젯 URL */}
          <div className="border-2 border-blue-200 bg-blue-50 p-4 rounded-lg">
            <label className="block text-sm font-bold mb-2 text-blue-600">
              🎮 3. 루틴 플레이어 위젯
            </label>
            <div className="bg-white p-3 rounded-md break-all mb-3">
              <code className="text-xs">{widgetUrls.routine}</code>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(widgetUrls.routine)}
                className="flex-1 bg-blue-500 text-white p-2 rounded-md pixel-button hover:bg-blue-600 transition-colors text-sm"
              >
                📋 복사
              </button>
              <button
                onClick={() => window.open(widgetUrls.routine, '_blank', 'width=320,height=210')}
                className="flex-1 bg-blue-400 text-white p-2 rounded-md pixel-button hover:bg-blue-500 transition-colors text-sm"
              >
                🔗 열기
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 p-3 rounded-md">
            <p className="text-xs font-bold text-blue-800 mb-1">
              📌 Notion에 임베드하는 방법:
            </p>
            <ol className="text-xs space-y-0.5 text-blue-700 list-decimal list-inside">
              <li>Notion 페이지에서 /embed 입력</li>
              <li>위 URL 붙여넣기</li>
              <li>크기 조정 (권장: 350×450px)</li>
            </ol>
          </div>

          <button
            onClick={() => {
              setStep(1)
              setApiToken('')
              setSelectedDb('')
            }}
            className="w-full bg-gray-200 text-gray-dark p-3 rounded-md pixel-button hover:bg-gray-300 transition-colors"
          >
            🔄 새 위젯 만들기
          </button>
        </div>
      )}
    </div>
  )
}

