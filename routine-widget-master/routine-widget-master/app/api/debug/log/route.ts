import { NextRequest, NextResponse } from 'next/server'

const MAX_LOG_BODY = 10_000

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, User-Agent, X-Widget-Viewport, X-Widget-Referrer',
}

export async function POST(req: NextRequest) {
  try {
    const contentLength = Number(req.headers.get('content-length') || '0')
    if (contentLength > MAX_LOG_BODY) {
      return NextResponse.json(
        { error: 'Payload too large' }, 
        { status: 413, headers: corsHeaders }
      )
    }

    const payload = await req.json().catch(() => null)

    if (!payload || typeof payload !== 'object') {
      return NextResponse.json(
        { error: 'Invalid payload' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    const { log, userAgent } = payload as { log?: any; userAgent?: string }

    if (!log || typeof log !== 'object') {
      return NextResponse.json(
        { error: 'Missing log payload' }, 
        { status: 400, headers: corsHeaders }
      )
    }

    const sanitized = {
      id: log.id,
      level: log.level,
      timestamp: log.timestamp,
      message: log.message,
      meta: log.meta,
      userAgent,
      headers: {
        viewport: req.headers.get('x-widget-viewport') || 'unknown',
        referrer: req.headers.get('x-widget-referrer') || 'unknown',
      },
      receivedAt: Date.now(),
    }

    console.info('[widget-log]', JSON.stringify(sanitized))

    return NextResponse.json({ ok: true }, { headers: corsHeaders })
  } catch (err: any) {
    console.error('Remote log error:', err)
    return NextResponse.json(
      { error: 'Failed to record log', detail: err instanceof Error ? err.message : String(err) },
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

