/**
 * 데이터베이스 스키마 분석 API
 * BE/API: 데이터베이스 속성을 자동으로 분석하여 매칭
 */

import { NextRequest, NextResponse } from 'next/server';
import { NotionService } from '@/lib/notion';
import { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, databaseId } = body;

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'API key is required',
        },
      }, { status: 400 });
    }

    if (!databaseId || typeof databaseId !== 'string') {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'INVALID_DATABASE_ID',
          message: 'Database ID is required',
        },
      }, { status: 400 });
    }

    // 데이터베이스 스키마 자동 분석
    const result = await NotionService.autoDetectProperties(apiKey, databaseId);

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: 'Failed to analyze database schema',
          details: result.error.message,
        },
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<{
      dateProperty: string;
      titleProperty: string;
      scheduleProperties?: string[];
      importantProperty: string;
    }>>({
      success: true,
      data: result.data,
    });

  } catch (error) {
    console.error('Analyze database API error:', error);
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

