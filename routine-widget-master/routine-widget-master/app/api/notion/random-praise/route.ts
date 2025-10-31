import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

// 캐싱 완전 비활성화 (동적 렌더링 강제)
export const dynamic = 'force-dynamic'
export const revalidate = 0

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
}

export async function POST(req: NextRequest) {
  try {
    const { token, databaseId, excludePraise } = await req.json()

    if (!token || !databaseId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400, headers: corsHeaders }
      )
    }

    const notion = new Client({ auth: token })

    // 최근 10개만 조회 (속도 개선: 50개 → 10개)
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [{
        property: 'Date',
        direction: 'descending'
      }],
      page_size: 10  // 10개로 줄여서 속도 향상
    })

    // 칭찬 속성이 있는 항목들만 필터링 (마지막 칭찬 제외)
    const praiseList: string[] = []
    
    for (const page of response.results) {
      const props = (page as any).properties
      
      if (props['칭찬']?.rich_text?.[0]?.plain_text) {
        const praise = props['칭찬'].rich_text[0].plain_text
        if (praise && praise.trim() !== '' && praise !== excludePraise) {
          praiseList.push(praise)
        }
      }
      
      // 5개 이상 찾으면 조기 종료 (속도 최적화)
      if (praiseList.length >= 5) break
    }

    // 칭찬 항목이 없으면 기본 메시지
    if (praiseList.length === 0) {
      // 제외된 칭찬만 있는 경우, 다시 포함시켜서 선택
      if (excludePraise) {
        return NextResponse.json(
          { praise: excludePraise },  // 어쩔 수 없이 같은 칭찬 반환
          { headers: corsHeaders }
        )
      }
      return NextResponse.json(
        { praise: '오늘도 화이팅!' },
        { headers: corsHeaders }
      )
    }

    // 랜덤으로 칭찬 선택
    const randomIndex = Math.floor(Math.random() * praiseList.length)
    const randomPraise = praiseList[randomIndex]

    return NextResponse.json(
      { praise: randomPraise },
      { headers: corsHeaders }
    )

  } catch (error: any) {
    console.error('Random praise error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch random praise: ' + error.message },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}

