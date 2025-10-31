import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function POST(req: NextRequest) {
  try {
    // Body 파싱 안전 처리
    let token = '' as string
    let databaseId = '' as string
    let completedCount = 0 as number
    let totalCount = 0 as number
    let mood = '' as string
    let date = new Date().toISOString()
    let routineEmojis = '' as string
    let isSecondRoutine = false as boolean
    try {
      const raw = await req.text()
      if (raw && raw.trim().length > 0) {
        const parsed = JSON.parse(raw)
        token = parsed.token || ''
        databaseId = parsed.databaseId || ''
        completedCount = parsed.completedCount || 0
        totalCount = parsed.totalCount || 0
        mood = parsed.mood || ''
        date = parsed.date || new Date().toISOString()
        routineEmojis = parsed.routineEmojis || ''
        isSecondRoutine = parsed.isSecondRoutine || false
      }
    } catch (e) {
      // 무시하고 아래 검증으로 처리
    }

    if (!token || !databaseId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400, headers: corsHeaders }
      )
    }

    const notion = new Client({ auth: token })

    // 한국 시간대(KST, UTC+9) 기준으로 오늘 날짜 계산
    const now = new Date(date)
    const kstOffset = 9 * 60 // 한국은 UTC+9
    const kstTime = new Date(now.getTime() + kstOffset * 60 * 1000)
    
    // 나이트루틴 보정: 새벽 4시 전이면 전날로 계산
    const cutoffHour = 4 // 새벽 4시를 기준으로 설정
    if (kstTime.getHours() < cutoffHour) {
      kstTime.setDate(kstTime.getDate() - 1) // 하루 빼기
    }
    
    // 한국 시간 기준 오늘 날짜 (YYYY-MM-DD)
    const kstDateString = kstTime.toISOString().split('T')[0]
    
    // 오늘 날짜로 페이지 찾기 (UTC 기준이지만 한국 날짜로 검색)
    const today = new Date(kstDateString + 'T00:00:00Z')
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const response = await notion.databases.query({
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

    // 오늘 페이지가 없으면 에러 반환 (매일 자동으로 생성되므로)
    if (response.results.length === 0) {
      return NextResponse.json(
        { error: `${kstDateString} 날짜의 페이지를 찾을 수 없습니다. 노션에서 해당 날짜 페이지를 먼저 생성해주세요.` },
        { status: 404, headers: corsHeaders }
      )
    }

    // 오늘 페이지 업데이트
    const pageId = response.results[0].id
    
    // 체크박스 상태에 따라 다른 속성에 이모지 저장
    if (routineEmojis) {
      const propertyName = isSecondRoutine ? 'ROUTINE (2)' : 'ROUTINE'
      await notion.pages.update({
        page_id: pageId,
        properties: {
          [propertyName]: {
            rich_text: [{
              type: 'text',
              text: { content: routineEmojis }
            }]
          }
        }
      })
    }

    // 페이지 내부에 블록으로 루틴 완료 정보 추가
    // 기존 블록 가져오기
    const blocks = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100
    })

    // 만족도에서 숫자만 추출
    const moodScore = mood.replace('점', '')

    // 모닝/나이트 루틴 구분
    const reportTitle = isSecondRoutine 
      ? "🌙 NIGHT ROUTINE REPORT" 
      : "☀️ MORNING ROUTINE REPORT"
    
    // 해당 루틴 타입의 기존 리포트만 찾아서 삭제
    const targetReportTitle = isSecondRoutine ? "NIGHT ROUTINE REPORT" : "MORNING ROUTINE REPORT"
    const routineBlockIndex = blocks.results.findIndex((block: any) => 
      block.type === 'heading_3' && 
      block.heading_3?.rich_text?.[0]?.plain_text?.includes(targetReportTitle)
    )

    if (routineBlockIndex >= 0) {
      // 기존 블록 삭제 (헤딩 + 내용 3개)
      const blocksToDelete = blocks.results.slice(routineBlockIndex, routineBlockIndex + 4)
      for (const block of blocksToDelete) {
        try {
          await notion.blocks.delete({ block_id: block.id })
        } catch (e) {
          // 이미 삭제된 블록일 수 있음
        }
      }
    }

    // 새로운 루틴 완료 정보 추가
    await notion.blocks.children.append({
      block_id: pageId,
      children: [
        {
          type: 'heading_3',
          heading_3: {
            rich_text: [{
              type: 'text',
              text: { content: reportTitle }
            }]
          }
        },
        {
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              type: 'text',
              text: { content: '' }
            }]
          }
        },
        {
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              type: 'text',
              text: { content: `🎉 총 ${completedCount}개의 루틴을 완료했어요!` }
            }]
          }
        },
        {
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              type: 'text',
              text: { content: `💕 오늘의 루틴 만족도 : ${moodScore}점` }
            }]
          }
        }
      ]
    })

    return NextResponse.json({ success: true }, { headers: corsHeaders })

  } catch (error: any) {
    console.error('Save routine error:', error)
    return NextResponse.json(
      { error: 'Failed to save routine: ' + error.message },
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

