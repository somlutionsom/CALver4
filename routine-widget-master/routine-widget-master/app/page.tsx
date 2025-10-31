'use client'

import { useState } from 'react'
import OnboardingFlow from './components/OnboardingFlow'
import WidgetPreview from './components/WidgetPreview'

export default function Home() {
  const [widgetUrls, setWidgetUrls] = useState({ profile: '', dialogue: '', routine: '' })
  const [config, setConfig] = useState<any>(null)

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-light via-pink-medium to-purple-light p-4 md:p-8" style={{ 
      background: 'linear-gradient(to bottom right, #FFE5F0, #FFDAE8, #F5E5FF)' 
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-dark mb-2 py-6">
            🕹️ SOMLUTION ROUTINE WIDGET 🕹️
          </h1>
          <p className="text-gray-dark/70 text-sm pb-4">
            모든 저작권은 SOMLUTION에게 있습니다
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <div>
            <OnboardingFlow 
              onComplete={(profileUrl: string, dialogueUrl: string, routineUrl: string, cfg: any) => {
                setWidgetUrls({ profile: profileUrl, dialogue: dialogueUrl, routine: routineUrl })
                setConfig(cfg)
              }} 
            />
          </div>
          
          <div>
            <WidgetPreview config={config} urls={widgetUrls} />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-sm text-gray-dark/70">
          <p className="mb-1">created by SOMLUTION</p>
          <p className="mb-1">
            ❤️ <a href="https://x.com/somnote_" target="_blank" rel="noopener noreferrer" className="hover:text-pink-medium transition-colors underline">X (@somnote_)</a>
          </p>
          <p>💌 somlution@gmail.com</p>
        </footer>
      </div>
    </main>
  )
}
