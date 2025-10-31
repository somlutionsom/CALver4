'use client'

interface WidgetPreviewProps {
  config: any
  urls: { profile: string; dialogue: string; routine: string }
}

export default function WidgetPreview({ config, urls }: WidgetPreviewProps) {
  if (!config) {
    return (
      <div className="bg-white rounded-lg p-6 window-frame">
        <div className="border-b-2 border-gray-200 pb-2 mb-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
        </div>
        <div className="flex items-center justify-center h-[500px] text-gray-400">
          <div className="text-center">
            <div className="text-6xl mb-4">📱</div>
            <p className="text-sm">위젯 설정을 완료하면</p>
            <p className="text-sm">여기에 미리보기가 표시됩니다</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 프로필 위젯 미리보기 */}
      <div className="bg-white rounded-lg p-4 window-frame">
        <div className="border-b-2 border-gray-200 pb-2 mb-3">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <span className="text-xs text-pink-600 font-bold">🎮 프로필 위젯</span>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-md overflow-hidden">
          <iframe
            src={urls.profile}
            className="w-full h-[380px] border-0"
            title="Profile Widget Preview"
          />
        </div>
      </div>

      {/* 칭찬 위젯 미리보기 */}
      <div className="bg-white rounded-lg p-4 window-frame">
        <div className="border-b-2 border-gray-200 pb-2 mb-3">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <span className="text-xs text-purple-600 font-bold">💬 칭찬 위젯</span>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-md overflow-hidden">
          <iframe
            src={urls.dialogue}
            className="w-full h-[130px] border-0"
            title="Dialogue Widget Preview"
          />
        </div>
      </div>

      {/* 루틴 플레이어 위젯 미리보기 */}
      <div className="bg-white rounded-lg p-4 window-frame">
        <div className="border-b-2 border-gray-200 pb-2 mb-3">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <span className="text-xs text-blue-600 font-bold">🎮 루틴 플레이어 위젯</span>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-md overflow-hidden">
          <iframe
            src={urls.routine}
            className="w-full h-[240px] border-0"
            title="Routine Widget Preview"
          />
        </div>
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        * 실제 위젯은 Notion 데이터를 실시간으로 불러옵니다
      </p>
    </div>
  )
}

