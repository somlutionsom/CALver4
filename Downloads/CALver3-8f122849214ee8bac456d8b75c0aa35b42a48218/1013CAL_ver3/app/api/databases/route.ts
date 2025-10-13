/**
 * 데이터베이스 목록 조회 API
 * BE/API: Notion API로 연결된 데이터베이스 목록 가져오기
 */

import { NextRequest, NextResponse } from 'next/server';
import { NotionService } from '@/lib/notion';
import { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'API key is required',
        },
      }, { status: 400 });
    }

    // Notion API로 데이터베이스 목록 가져오기
    const result = await NotionService.listDatabases(apiKey);

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch databases',
          details: result.error.message,
        },
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<Array<{ id: string; title: string }>>>({
      success: true,
      data: result.data,
    });

  } catch (error) {
    console.error('Databases API error:', error);
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

