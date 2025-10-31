/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 이미지 최적화 비활성화 (Vercel 한도 절약)
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.us-west-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'www.notion.so',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    const frameAncestorPolicy = [
      "'self'",
      'https://www.notion.so',
      'https://notion.so',
      'https://www.notion.site',
      'https://notion.site',
      'https://www.notion.com',
      'https://notion.com',
      'https://*.notion.so',
      'https://*.notion.site',
      'https://*.notion.com',
      'https://notion.new',
      'notion://*'
    ].join(' ')

    const sharedHeaders = [
      {
        key: 'X-Frame-Options',
        value: 'ALLOWALL',
      },
      {
        key: 'Content-Security-Policy',
        value: `frame-ancestors ${frameAncestorPolicy};`
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'Access-Control-Allow-Origin',
        value: '*',
      }
    ]

    return [
      {
        // 위젯 임베드 경로 (쿼리 파라미터 포함)
        source: '/widget/:path*',
        headers: sharedHeaders,
      },
      {
        // 정적 테스트 페이지도 임베드 허용
        source: '/widget-test/:path*',
        headers: sharedHeaders,
      },
      {
        // 디버그 API에서 원격 로깅 허용
        source: '/api/debug/:path*',
        headers: [
          ...sharedHeaders,
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type,User-Agent'
          }
        ],
      }
    ]
  },
}

module.exports = nextConfig

