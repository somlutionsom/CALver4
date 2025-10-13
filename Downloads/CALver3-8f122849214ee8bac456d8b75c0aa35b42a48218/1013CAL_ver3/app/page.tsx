/**
 * 홈페이지
 * PM/UX: 위젯 소개 및 온보딩 안내
 */

'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            심플 캘린더 위젯
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Notion 데이터베이스와 연동하여 사용하는 깔끔한 캘린더 위젯
          </p>
          <Link
            href="/onboarding"
            className="inline-block bg-gray-800 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            시작하기
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Notion 연동</h3>
            <p className="text-gray-600">
              Notion 데이터베이스와 실시간으로 연동하여 일정을 자동으로 표시합니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">커스터마이징</h3>
            <p className="text-gray-600">
              원하는 색상 테마를 설정하여 나만의 캘린더를 만들 수 있습니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">반응형</h3>
            <p className="text-gray-600">
              데스크톱과 모바일 모든 환경에서 완벽하게 동작합니다.
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-center">사용 방법</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Notion Integration 생성</h4>
                <p className="text-gray-600">
                  Notion에서 Integration을 생성하고 API 키를 발급받습니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">데이터베이스 연결</h4>
                <p className="text-gray-600">
                  사용할 Notion 데이터베이스에 Integration을 연결합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">위젯 설정</h4>
                <p className="text-gray-600">
                  온보딩 페이지에서 API 키와 속성을 설정합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">임베드 및 사용</h4>
                <p className="text-gray-600">
                  생성된 URL을 iframe으로 임베드하여 사용합니다.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/onboarding"
              className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              지금 시작하기 →
            </Link>
          </div>
        </div>

        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>
            문의사항이 있으시면{' '}
            <a
              href="https://github.com/your-username/simple-calendar-widget"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:underline"
            >
              GitHub
            </a>
            를 참고해주세요.
          </p>
        </div>
      </main>
    </div>
  );
}
