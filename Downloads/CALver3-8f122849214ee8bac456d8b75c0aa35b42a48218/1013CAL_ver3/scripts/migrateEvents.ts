/**
 * Notion DB 마이그레이션 스크립트
 * 기존 모델(1 페이지 = 1 날짜, 여러 일정 속성) → 새 모델(1 페이지 = 1 이벤트)
 * 
 * 사용법:
 * $ npm install tsx --save-dev
 * $ npx tsx scripts/migrateEvents.ts
 * 
 * 환경 변수:
 * - NOTION_API_KEY: Notion API 키
 * - SOURCE_DATABASE_ID: 기존 데이터베이스 ID
 * - TARGET_DATABASE_ID: 새 데이터베이스 ID (선택사항, 없으면 SOURCE와 동일)
 */

import { Client } from '@notionhq/client';
import * as readline from 'readline';

// 환경 변수 확인
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const SOURCE_DATABASE_ID = process.env.SOURCE_DATABASE_ID;
const TARGET_DATABASE_ID = process.env.TARGET_DATABASE_ID || SOURCE_DATABASE_ID;

if (!NOTION_API_KEY || !SOURCE_DATABASE_ID) {
  console.error('❌ 필수 환경 변수가 설정되지 않았습니다.');
  console.error('환경 변수 설정 방법:');
  console.error('  export NOTION_API_KEY="your-api-key"');
  console.error('  export SOURCE_DATABASE_ID="your-database-id"');
  console.error('  export TARGET_DATABASE_ID="your-target-database-id" (선택사항)');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });

interface LegacyPage {
  id: string;
  date: string;
  title: string;
  schedules: string[];
  isImportant: boolean;
}

interface MigrationStats {
  totalPages: number;
  migratedEvents: number;
  skippedPages: number;
  errors: number;
}

/**
 * 사용자 확인 프롬프트
 */
async function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * 기존 DB에서 모든 페이지 가져오기
 */
async function fetchLegacyPages(databaseId: string): Promise<LegacyPage[]> {
  console.log('📥 기존 데이터베이스에서 페이지를 가져오는 중...');
  
  const pages: LegacyPage[] = [];
  let hasMore = true;
  let startCursor: string | undefined = undefined;

  while (hasMore) {
    try {
      const response = await notion.databases.query({
        database_id: databaseId,
        start_cursor: startCursor,
        page_size: 100,
      });

      for (const page of response.results) {
        if (!('properties' in page)) continue;

        const properties = page.properties;
        
        // 날짜 추출
        let date = '';
        for (const [name, prop] of Object.entries(properties)) {
          if ('date' in prop && prop.date?.start) {
            date = prop.date.start;
            break;
          }
        }

        if (!date) continue;

        // 제목 추출
        let title = '';
        for (const [name, prop] of Object.entries(properties)) {
          if ('title' in prop && prop.title?.[0]) {
            title = prop.title[0].plain_text || '';
            break;
          }
        }

        // 일정 속성 추출 (일정1, 일정2, ...)
        const schedules: string[] = [];
        for (const [name, prop] of Object.entries(properties)) {
          if (name.includes('일정') || name.toLowerCase().includes('schedule')) {
            if ('rich_text' in prop && prop.rich_text?.[0]) {
              const text = prop.rich_text[0].plain_text;
              if (text) schedules.push(text);
            }
          }
        }

        // 중요 여부 추출
        let isImportant = false;
        for (const [name, prop] of Object.entries(properties)) {
          if (name === '중요' || name.toLowerCase() === 'important') {
            if ('select' in prop && prop.select) {
              isImportant = prop.select.name === '중요' || prop.select.name.toLowerCase() === 'important';
            } else if ('checkbox' in prop) {
              isImportant = prop.checkbox === true;
            }
            break;
          }
        }

        pages.push({
          id: page.id,
          date,
          title,
          schedules,
          isImportant,
        });
      }

      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    } catch (error) {
      console.error('❌ 페이지 가져오기 실패:', error);
      throw error;
    }
  }

  console.log(`✅ ${pages.length}개 페이지를 찾았습니다.`);
  return pages;
}

/**
 * 새 DB에 이벤트 생성
 */
async function createEvent(
  databaseId: string,
  date: string,
  eventTitle: string,
  isImportant: boolean
): Promise<boolean> {
  try {
    // 대상 DB의 속성 확인
    const database = await notion.databases.retrieve({ database_id: databaseId });
    const properties = database.properties;

    // 필수 속성 찾기
    let dateProp = '';
    let titleProp = '';
    let importantProp = '';

    for (const [name, prop] of Object.entries(properties)) {
      if ('type' in prop) {
        if (prop.type === 'date' && !dateProp) dateProp = name;
        if (prop.type === 'title' && !titleProp) titleProp = name;
        if ((name === '중요' || name.toLowerCase() === 'important') && prop.type === 'select') {
          importantProp = name;
        }
      }
    }

    if (!dateProp || !titleProp) {
      console.error('❌ 대상 DB에 필수 속성(Date, Title)이 없습니다.');
      return false;
    }

    // 페이지 생성
    const pageProperties: any = {
      [titleProp]: {
        title: [
          {
            text: {
              content: eventTitle,
            },
          },
        ],
      },
      [dateProp]: {
        date: {
          start: date,
        },
      },
    };

    // 중요 속성이 있으면 추가
    if (importantProp && isImportant) {
      pageProperties[importantProp] = {
        select: {
          name: '중요',
        },
      };
    }

    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: pageProperties,
    });

    return true;
  } catch (error) {
    console.error(`❌ 이벤트 생성 실패 (${eventTitle}):`, error);
    return false;
  }
}

/**
 * 마이그레이션 실행
 */
async function migrate(dryRun: boolean = false): Promise<MigrationStats> {
  const stats: MigrationStats = {
    totalPages: 0,
    migratedEvents: 0,
    skippedPages: 0,
    errors: 0,
  };

  // 1. 기존 페이지 가져오기
  const legacyPages = await fetchLegacyPages(SOURCE_DATABASE_ID!);
  stats.totalPages = legacyPages.length;

  if (legacyPages.length === 0) {
    console.log('⚠️  마이그레이션할 페이지가 없습니다.');
    return stats;
  }

  // 2. 마이그레이션 계획 출력
  console.log('\n📋 마이그레이션 계획:');
  console.log(`  - 총 페이지: ${legacyPages.length}`);
  
  let totalEvents = 0;
  for (const page of legacyPages) {
    if (page.schedules.length > 0) {
      totalEvents += page.schedules.length;
    } else {
      totalEvents += 1; // 일정이 없어도 페이지 자체를 하나의 이벤트로 생성
    }
  }
  console.log(`  - 생성될 이벤트: ${totalEvents}`);
  console.log(`  - 대상 DB: ${TARGET_DATABASE_ID === SOURCE_DATABASE_ID ? '동일 DB' : '새 DB'}`);

  if (dryRun) {
    console.log('\n🔍 [DRY RUN] 실제 변경은 수행되지 않습니다.\n');
  }

  // 3. 사용자 확인
  if (!dryRun) {
    const confirmed = await confirm('\n계속 진행하시겠습니까?');
    if (!confirmed) {
      console.log('❌ 마이그레이션이 취소되었습니다.');
      process.exit(0);
    }
  }

  // 4. 마이그레이션 실행
  console.log('\n🚀 마이그레이션을 시작합니다...\n');

  for (const page of legacyPages) {
    console.log(`\n처리 중: ${page.title || '제목 없음'} (${page.date})`);
    
    if (page.schedules.length === 0) {
      // 일정이 없는 경우, 페이지 제목을 이벤트로 생성
      if (!dryRun) {
        const success = await createEvent(
          TARGET_DATABASE_ID!,
          page.date,
          page.title || '제목 없음',
          page.isImportant
        );
        if (success) {
          stats.migratedEvents++;
          console.log(`  ✅ 이벤트 생성: ${page.title || '제목 없음'}`);
        } else {
          stats.errors++;
        }
      } else {
        console.log(`  [DRY RUN] 생성할 이벤트: ${page.title || '제목 없음'}`);
        stats.migratedEvents++;
      }
    } else {
      // 일정이 있는 경우, 각 일정을 개별 이벤트로 생성
      for (const schedule of page.schedules) {
        if (!dryRun) {
          const success = await createEvent(
            TARGET_DATABASE_ID!,
            page.date,
            schedule,
            page.isImportant
          );
          if (success) {
            stats.migratedEvents++;
            console.log(`  ✅ 이벤트 생성: ${schedule}`);
          } else {
            stats.errors++;
          }
          
          // API 요청 제한 방지를 위한 딜레이
          await new Promise(resolve => setTimeout(resolve, 300));
        } else {
          console.log(`  [DRY RUN] 생성할 이벤트: ${schedule}`);
          stats.migratedEvents++;
        }
      }
    }
  }

  return stats;
}

/**
 * 메인 함수
 */
async function main() {
  console.log('🔄 Notion DB 마이그레이션 도구');
  console.log('================================\n');

  try {
    // Dry run 먼저 실행
    const dryRunStats = await migrate(true);
    
    console.log('\n\n📊 Dry Run 결과:');
    console.log(`  - 총 페이지: ${dryRunStats.totalPages}`);
    console.log(`  - 생성될 이벤트: ${dryRunStats.migratedEvents}`);
    console.log(`  - 건너뛴 페이지: ${dryRunStats.skippedPages}`);

    // 실제 마이그레이션 확인
    const proceed = await confirm('\n실제 마이그레이션을 진행하시겠습니까?');
    if (!proceed) {
      console.log('❌ 마이그레이션이 취소되었습니다.');
      process.exit(0);
    }

    // 실제 마이그레이션 실행
    const stats = await migrate(false);

    console.log('\n\n✅ 마이그레이션 완료!');
    console.log('================================');
    console.log(`  - 총 페이지: ${stats.totalPages}`);
    console.log(`  - 생성된 이벤트: ${stats.migratedEvents}`);
    console.log(`  - 건너뛴 페이지: ${stats.skippedPages}`);
    console.log(`  - 오류: ${stats.errors}`);

    if (stats.errors > 0) {
      console.log('\n⚠️  일부 오류가 발생했습니다. 로그를 확인하세요.');
    }

    console.log('\n⚠️  중요: 기존 데이터를 확인하고, 문제가 없으면 수동으로 삭제하세요.');
  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}


