import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    
    if (!token || !token.startsWith('ntn_')) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 400, headers: corsHeaders }
      )
    }
    
    const notion = new Client({ auth: token })
    
    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'database'
      },
      page_size: 100
    })
    
    return NextResponse.json({ databases: response.results }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('Database fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch databases: ' + error.message },
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

