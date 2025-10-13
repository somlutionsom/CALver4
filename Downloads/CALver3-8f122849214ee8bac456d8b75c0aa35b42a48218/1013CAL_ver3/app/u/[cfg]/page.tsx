/**
 * 위젯 임베드 페이지
 * FE 리드: 실제 위젯 렌더링
 * PM/UX: 임베드 가능한 위젯 페이지
 */

'use client';

import React, { useState, use } from 'react';
import { SimpleCalendar } from '@/app/components/SimpleCalendar';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { WidgetConfig } from '@/lib/types';

interface PageProps {
  params: Promise<{ cfg: string }>;
}

export default function WidgetPage({ params }: PageProps) {
  const { cfg: encodedConfig } = use(params);
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [error, setError] = useState(false);

  // URL 파라미터에서 설정 디코딩
  React.useEffect(() => {
    try {
      console.log('Encoded config:', encodedConfig);
      
      // URL-safe Base64 디코딩 (UTF-8 지원)
      let base64 = encodedConfig.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }

      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const decodedString = new TextDecoder().decode(bytes);
      const decodedData = JSON.parse(decodedString);
      console.log('Decoded data:', decodedData);
      
      // 간단한 형식을 WidgetConfig로 변환
      const widgetConfig: WidgetConfig = {
        id: 'embedded',
        notionConfig: {
          apiKey: decodedData.token,
          databaseId: decodedData.dbId,
          dateProperty: decodedData.dateProp,
          titleProperty: decodedData.titleProp,
          scheduleProperties: decodedData.scheduleProps,
          importantProperty: decodedData.importantProp,
        },
        theme: {
          primaryColor: decodedData.primaryColor,
          accentColor: decodedData.accentColor,
          importantColor: decodedData.importantColor,
          backgroundColor: decodedData.backgroundColor,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      console.log('Widget config created:', widgetConfig);
      setConfig(widgetConfig);
    } catch (err) {
      console.error('Config decode error:', err);
      setError(true);
    }
  }, [encodedConfig]);

  if (error || !config) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f7fafc',
        padding: '2rem',
      }}>
        <div style={{
          textAlign: 'center',
          color: '#e53e3e',
        }}>
          <h2>위젯 설정 오류</h2>
          <p>URL 파라미터가 올바르지 않습니다.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '0.5rem',
      background: 'transparent',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
      }}>
            <ErrorBoundary>
              <SimpleCalendar
                configId="embedded"
                config={config}
                theme={config.theme}
              />
            </ErrorBoundary>
      </div>
    </div>
  );
}

