/**
 * Notion 서비스 통합
 * BE/API: Notion API 연동 및 데이터 처리
 * 성능: 캐싱 및 최적화
 */

import { Client } from '@notionhq/client';
import { CalendarEvent, NotionConfig, Result } from './types';
import { validateDateFormat } from './validation';

export class NotionService {
  private client: Client;
  private config: NotionConfig;

  constructor(config: NotionConfig) {
    this.client = new Client({
      auth: config.apiKey,
    });
    this.config = config;
  }

  // 데이터베이스에서 이벤트 가져오기
  async fetchEvents(
    startDate: string,
    endDate: string
  ): Promise<Result<CalendarEvent[]>> {
    try {
      if (!validateDateFormat(startDate) || !validateDateFormat(endDate)) {
        return { success: false, error: new Error('Invalid date format') };
      }

      const response = await this.client.databases.query({
        database_id: this.config.databaseId,
        filter: {
          and: [
            {
              property: this.config.dateProperty,
              date: {
                on_or_after: startDate,
              },
            },
            {
              property: this.config.dateProperty,
              date: {
                on_or_before: endDate,
              },
            },
          ],
        },
      });

      const events: CalendarEvent[] = [];

      for (const page of response.results) {
        if (!('properties' in page)) continue;

        const event = this.parsePageToEvent(page);
        if (event) {
          events.push(event);
        }
      }

      return { success: true, data: events };
    } catch (error) {
      console.error('Failed to fetch Notion events:', error);
      return {
        success: false,
        error: new Error(`Failed to fetch events: ${error}`),
      };
    }
  }

  // Notion 페이지를 CalendarEvent로 변환
  // 1개 페이지 = 1개 이벤트 (페이지 제목만 사용)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parsePageToEvent(page: any): CalendarEvent | null {
    try {
      if (!('properties' in page)) return null;
      const properties = page.properties;
      
      // 날짜 추출
      const dateProperty = properties[this.config.dateProperty];
      if (!dateProperty?.date?.start) return null;
      
      const date = dateProperty.date.start;
      
      // 제목 추출 (Notion 페이지 제목 = 이벤트 이름)
      let title = '';
      const titleProperty = properties[this.config.titleProperty];
      if (titleProperty?.type === 'title' && titleProperty.title?.[0]) {
        title = titleProperty.title[0].plain_text || '';
      } else if (titleProperty?.type === 'rich_text' && titleProperty.rich_text?.[0]) {
        title = titleProperty.rich_text[0].plain_text || '';
      }
      
      // 중요 여부 추출
      let isImportant = false;
      const importantProperty = properties[this.config.importantProperty];
      if (importantProperty?.type === 'select' && importantProperty.select) {
        isImportant = importantProperty.select.name === '중요' || 
                     importantProperty.select.name.toLowerCase() === 'important';
      } else if (importantProperty?.type === 'checkbox') {
        isImportant = importantProperty.checkbox === true;
      }
      
      // 페이지 URL 생성
      const pageUrl = `https://notion.so/${page.id.replace(/-/g, '')}`;
      
      return {
        id: page.id,
        date,
        title: title || '제목 없음',
        isImportant,
        pageUrl,
      };
    } catch (error) {
      console.error('Failed to parse Notion page:', error);
      return null;
    }
  }

  // 데이터베이스 스키마 자동 매칭
  static async autoDetectProperties(apiKey: string, databaseId: string): Promise<Result<{
    dateProperty: string;
    titleProperty: string;
    scheduleProperties?: string[]; // Optional: 레거시 호환
    importantProperty: string;
  }>> {
    try {
      const client = new Client({ auth: apiKey });
      const database = await client.databases.retrieve({
        database_id: databaseId,
      });

      const properties = database.properties;
      let dateProperty = '';
      let titleProperty = '';
      const scheduleProperties: string[] = [];
      let importantProperty = '';

      // 속성 타입별로 자동 매칭
      for (const [name, prop] of Object.entries(properties)) {
        const propType = 'type' in prop ? prop.type : null;
        
        // Date 타입 찾기
        if (propType === 'date' && !dateProperty) {
          dateProperty = name;
        }
        
        // Title 타입 찾기
        if (propType === 'title' && !titleProperty) {
          titleProperty = name;
        }
        
        // "일정" 또는 "schedule"이 포함된 Rich Text 속성 찾기 (레거시 호환)
        if (propType === 'rich_text' && 
            (name.includes('일정') || name.toLowerCase().includes('schedule'))) {
          scheduleProperties.push(name);
        }
        
        // "중요" Select 속성 찾기
        if (propType === 'select' && 
            (name === '중요' || name.toLowerCase() === 'important' || name.toLowerCase() === '중요도')) {
          importantProperty = name;
        }
      }

      // 레거시 호환: 일정 속성이 없으면 모든 rich_text 속성 추가 (최대 5개)
      // 새 모델에서는 이 속성들이 필요하지 않지만, 기존 DB 지원을 위해 유지
      if (scheduleProperties.length === 0) {
        for (const [name, prop] of Object.entries(properties)) {
          const propType = 'type' in prop ? prop.type : null;
          if (propType === 'rich_text' && scheduleProperties.length < 5) {
            scheduleProperties.push(name);
          }
        }
      }

      // 필수 속성이 없으면 에러
      if (!dateProperty) {
        return { 
          success: false, 
          error: new Error('Date 타입 속성을 찾을 수 없습니다.') 
        };
      }
      
      if (!titleProperty) {
        return { 
          success: false, 
          error: new Error('Title 타입 속성을 찾을 수 없습니다.') 
        };
      }

      // 중요 속성이 없으면 첫 번째 select 속성 사용
      if (!importantProperty) {
        for (const [name, prop] of Object.entries(properties)) {
          const propType = 'type' in prop ? prop.type : null;
          if (propType === 'select') {
            importantProperty = name;
            break;
          }
        }
      }

      // 중요 속성이 여전히 없으면 빈 문자열
      if (!importantProperty) {
        importantProperty = '';
      }

      return {
        success: true,
        data: {
          dateProperty,
          titleProperty,
          scheduleProperties: scheduleProperties.length > 0 ? scheduleProperties.slice(0, 5) : undefined, // Optional
          importantProperty,
        },
      };
    } catch (error) {
      console.error('Failed to auto-detect properties:', error);
      return {
        success: false,
        error: new Error(`Failed to analyze database: ${error}`),
      };
    }
  }

  // 데이터베이스 스키마 검증
  async validateDatabase(): Promise<Result<void>> {
    try {
      const database = await this.client.databases.retrieve({
        database_id: this.config.databaseId,
      });

      const properties = database.properties;
      
      // 필수 속성 확인
      if (!properties[this.config.dateProperty]) {
        return { 
          success: false, 
          error: new Error(`Date property '${this.config.dateProperty}' not found`) 
        };
      }
      
      if (!properties[this.config.titleProperty]) {
        return { 
          success: false, 
          error: new Error(`Title property '${this.config.titleProperty}' not found`) 
        };
      }
      
      // scheduleProperties는 optional이므로 존재할 때만 검증
      if (this.config.scheduleProperties) {
        for (const propName of this.config.scheduleProperties) {
          if (!properties[propName]) {
            console.warn(`Schedule property '${propName}' not found`);
          }
        }
      }
      
      if (this.config.importantProperty && !properties[this.config.importantProperty]) {
        console.warn(`Important property '${this.config.importantProperty}' not found`);
      }
      
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new Error(`Failed to validate database: ${error}`),
      };
    }
  }

  // 연결 테스트
  async testConnection(): Promise<Result<void>> {
    try {
      await this.client.users.me({});
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new Error(`Connection failed: ${error}`),
      };
    }
  }

  // 연결된 데이터베이스 목록 가져오기
  static async listDatabases(apiKey: string): Promise<Result<Array<{ id: string; title: string }>>> {
    try {
      const client = new Client({ auth: apiKey });
      
      // search API를 사용하여 데이터베이스 검색
      const response = await client.search({
        filter: {
          value: 'database',
          property: 'object',
        },
        page_size: 100,
      });

      const databases = response.results
        .filter((item): item is Extract<typeof response.results[number], { properties: unknown }> => 'properties' in item)
        .map((db) => {
          // 데이터베이스 제목 추출
          let title = 'Untitled';
          if ('title' in db && Array.isArray(db.title) && db.title.length > 0) {
            const titleObj = db.title[0];
            if (titleObj && 'plain_text' in titleObj) {
              title = titleObj.plain_text || 'Untitled';
            }
          }
          
          return {
            id: db.id,
            title: title,
          };
        });

      return { success: true, data: databases };
    } catch (error) {
      console.error('Failed to list databases:', error);
      return {
        success: false,
        error: new Error(`Failed to list databases: ${error}`),
      };
    }
  }
}

