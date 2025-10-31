import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

// 캐싱 완전 비활성화 (동적 렌더링 강제)
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface WidgetData {
  profileImage: string | null
  sleep: string
  energy: number
  name: string
  mainText: string
  praise?: string  // 칭찬 속성 추가
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
}

export async function POST(req: NextRequest) {
  try {
    // Body 파싱 안전 처리 (빈 바디/잘못된 JSON 대비)
    let token = '' as string
    let databaseId = '' as string
    try {
      const raw = await req.text()
      if (raw && raw.trim().length > 0) {
        const parsed = JSON.parse(raw)
        token = parsed.token || ''
        databaseId = parsed.databaseId || ''
      }
    } catch (e) {
      // 무시하고 아래의 필수값 검증으로 처리
    }
    
    if (!token || !databaseId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400, headers: corsHeaders }
      )
    }
    
    const notion = new Client({ auth: token })
    
    // 데이터베이스 정보 먼저 조회
    const dbInfo = await notion.databases.retrieve({ database_id: databaseId })
    const hasDateProperty = 'Date' in (dbInfo as any).properties
    
    if (!hasDateProperty) {
      // Date 속성이 없으면 최근 데이터만 조회
      const response = await notion.databases.query({
        database_id: databaseId,
        page_size: 1
      })
      
      if (response.results.length > 0) {
        const page: any = response.results[0]
        const properties = page.properties
        
        const data: WidgetData = {
          profileImage: 
            properties['profile image']?.files?.[0]?.file?.url || 
            properties['profile image']?.files?.[0]?.external?.url || 
            null,
          sleep: 
            properties.sleep?.formula?.string || 
            (properties.sleep?.formula?.number ? `${properties.sleep.formula.number}H` : '기록하기'),
          energy: properties.energy?.number || 0,
          name: properties.name?.rich_text?.[0]?.plain_text || 'Anonymous',
          mainText: properties['main text']?.rich_text?.[0]?.plain_text || '오늘도 좋은 하루!'
        }
        
        return NextResponse.json(data, { headers: corsHeaders })
      }
    }
    
    // 1. 오늘 날짜 데이터 조회 (에너지, 수면용)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const todayResponse = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: 'Date',
            date: {
              on_or_after: today.toISOString()
            }
          },
          {
            property: 'Date',
            date: {
              before: tomorrow.toISOString()
            }
          }
        ]
      },
      page_size: 1
    })
    
    // 2. 최근 데이터 조회 (프로필 사진, 닉네임, 텍스트용)
    const recentResponse = await notion.databases.query({
      database_id: databaseId,
      sorts: [{
        property: 'Date',
        direction: 'descending'
      }],
      page_size: 10  // 최근 10개 중에서 데이터가 있는 것 찾기
    })
    
    // 모든 데이터를 최근 데이터에서 찾기 (빠른 반영)
    let profileImage = null
    let name = 'Anonymous'
    let mainText = '오늘도 좋은 하루!'
    let praise = '오늘도 화이팅!'
    let sleep = '기록하기'
    let energy = 0
    let sleepFound = false
    let energyFound = false
    
    // 오늘 데이터 우선 확인 (있으면 우선 사용)
    if (todayResponse.results.length > 0) {
      const todayProps = (todayResponse.results[0] as any).properties
      
      const sleepData = todayProps.sleep?.formula?.string || 
                       (todayProps.sleep?.formula?.number ? `${todayProps.sleep.formula.number}H` : null)
      const energyData = todayProps.energy?.number
      
      if (sleepData !== null) {
        sleep = sleepData
        sleepFound = true
      }
      if (energyData !== null && energyData !== undefined) {
        energy = energyData
        energyFound = true
      }
    }
    
    for (const page of recentResponse.results) {
      const props = (page as any).properties
      
      if (!profileImage && props['profile image']?.files?.[0]) {
        profileImage = props['profile image']?.files?.[0]?.file?.url || 
                      props['profile image']?.files?.[0]?.external?.url
      }
      
      if (name === 'Anonymous' && props.name?.rich_text?.[0]?.plain_text) {
        name = props.name.rich_text[0].plain_text
      }
      
      if (mainText === '오늘도 좋은 하루!' && props['main text']?.rich_text?.[0]?.plain_text) {
        mainText = props['main text'].rich_text[0].plain_text
      }
      
      if (praise === '오늘도 화이팅!' && props['칭찬']?.rich_text?.[0]?.plain_text) {
        praise = props['칭찬'].rich_text[0].plain_text
      }
      
      // 오늘 데이터에서 못 찾은 경우 최근 데이터에서 찾기
      if (!sleepFound) {
        const sleepData = props.sleep?.formula?.string || 
                         (props.sleep?.formula?.number ? `${props.sleep.formula.number}H` : null)
        if (sleepData !== null) {
          sleep = sleepData
          sleepFound = true
        }
      }
      
      if (!energyFound) {
        const energyData = props.energy?.number
        if (energyData !== null && energyData !== undefined) {
          energy = energyData
          energyFound = true
        }
      }
      
      // 모든 데이터를 찾았으면 중단
      if (profileImage && name !== 'Anonymous' && mainText !== '오늘도 좋은 하루!' && 
          praise !== '오늘도 화이팅!' && sleepFound && energyFound) {
        break
      }
    }
    
    const data: WidgetData = {
      profileImage,
      sleep,
      energy,
      name,
      mainText,
      praise  // 칭찬 데이터 추가
    }
    
    return NextResponse.json(data, { headers: corsHeaders })
    
  } catch (error: any) {
    console.error('Widget data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch widget data: ' + error.message },
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

