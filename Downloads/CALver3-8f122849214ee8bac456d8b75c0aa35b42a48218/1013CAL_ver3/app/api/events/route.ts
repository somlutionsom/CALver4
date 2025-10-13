/**
 * 이벤트 조회 API (Body 기반)
 * BE/API: Notion에서 이벤트 가져오기
 */

import { NextRequest, NextResponse } from 'next/server';
import { NotionService } from '@/lib/notion';
import { ApiResponse, CalendarEvent, NotionConfig } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config, startDate, endDate } = body;

    if (!config || !startDate || !endDate) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'MISSING_PARAMS',
          message: 'Config, startDate, and endDate are required',
        },
      }, { status: 400 });
    }

    const notionConfig: NotionConfig = {
      apiKey: config.token,
      databaseId: config.dbId,
      dateProperty: config.dateProp,
      titleProperty: config.titleProp,
      scheduleProperties: config.scheduleProps,
      importantProperty: config.importantProp,
    };

    const notionService = new NotionService(notionConfig);
    const result = await notionService.fetchEvents(startDate, endDate);

    if (!result.success) {
      console.error('Notion API Error:', result.error);
      console.error('Config used:', notionConfig);
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'NOTION_API_ERROR',
          message: result.error.message,
        },
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse<CalendarEvent[]>>({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json<ApiResponse<never>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

