/**
 * 설정 저장 API
 * BE/API: 위젯 설정 생성 및 저장
 * 보안: API 키 검증 및 암호화
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateNotionConfig, validateDatabaseId } from '@/lib/validation';
import { NotionService } from '@/lib/notion';
import { WidgetConfig, ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await request.json();
    
    // Notion 설정 검증
    const validationResult = validateNotionConfig(body);
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'INVALID_CONFIG',
          message: validationResult.error.message,
        },
      }, { status: 400 });
    }
    
    const notionConfig = validationResult.data;
    
    // Database ID 형식 검증
    if (!validateDatabaseId(notionConfig.databaseId)) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'INVALID_DATABASE_ID',
          message: 'Invalid Notion database ID format',
        },
      }, { status: 400 });
    }
    
    // Notion 연결 테스트
    const notionService = new NotionService(notionConfig);
    const connectionTest = await notionService.testConnection();
    if (!connectionTest.success) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'CONNECTION_FAILED',
          message: 'Failed to connect to Notion API',
          details: connectionTest.error.message,
        },
      }, { status: 400 });
    }
    
    // 데이터베이스 스키마 검증
    const schemaValidation = await notionService.validateDatabase();
    if (!schemaValidation.success) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: {
          code: 'INVALID_SCHEMA',
          message: 'Database schema validation failed',
          details: schemaValidation.error.message,
        },
      }, { status: 400 });
    }
    
    // 위젯 설정 생성
    const widgetConfig: WidgetConfig = {
      id: crypto.randomUUID(),
      notionConfig,
      theme: body.theme || {
        primaryColor: '#4A5568',
        accentColor: '#ED64A6',
        importantColor: '#ED64A6',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // 핵심 정보만 간단하게 인코딩
    const theme = widgetConfig.theme || {
      primaryColor: '#4A5568',
      accentColor: '#ED64A6',
      importantColor: '#ED64A6',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    };
    
    const simpleConfig = {
      token: widgetConfig.notionConfig.apiKey,
      dbId: widgetConfig.notionConfig.databaseId,
      dateProp: widgetConfig.notionConfig.dateProperty,
      titleProp: widgetConfig.notionConfig.titleProperty,
      scheduleProps: widgetConfig.notionConfig.scheduleProperties,
      importantProp: widgetConfig.notionConfig.importantProperty,
      primaryColor: theme.primaryColor,
      accentColor: theme.accentColor,
      importantColor: theme.importantColor,
      backgroundColor: theme.backgroundColor,
    };
    
    // Base64 인코딩 (URL-safe)
    const encodedConfig = Buffer.from(JSON.stringify(simpleConfig))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    const embedUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/u/${encodedConfig}`;
    
    // 성공 응답
    return NextResponse.json<ApiResponse<{ configId: string; embedUrl: string }>>({
      success: true,
      data: {
        configId: encodedConfig,
        embedUrl,
      },
    });
    
  } catch (error) {
    console.error('Setup API error:', error);
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

