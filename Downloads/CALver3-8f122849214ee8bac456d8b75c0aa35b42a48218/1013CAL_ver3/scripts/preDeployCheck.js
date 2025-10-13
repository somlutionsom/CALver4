#!/usr/bin/env node

/**
 * Vercel 배포 전 빌드 오류 방지 체크리스트
 * 
 * 사용법:
 * $ node scripts/preDeployCheck.js
 * 또는
 * $ npm run pre-deploy
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 색상 출력을 위한 간단한 유틸리티
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function header(message) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`  ${message}`, colors.bright + colors.cyan);
  log('='.repeat(60), colors.cyan);
}

function checkItem(name, status, message = '') {
  const statusSymbol = {
    PASS: `${colors.green}✓ PASS${colors.reset}`,
    WARN: `${colors.yellow}⚠ WARN${colors.reset}`,
    FAIL: `${colors.red}✗ FAIL${colors.reset}`,
  };
  
  console.log(`${statusSymbol[status]} ${name}`);
  if (message) {
    console.log(`   ${colors.bright}→${colors.reset} ${message}`);
  }
}

// 프로젝트 루트 경로
const ROOT_DIR = path.resolve(__dirname, '..');

// 결과 집계
const results = {
  pass: 0,
  warn: 0,
  fail: 0,
  checks: []
};

function addResult(name, status, message = '') {
  results.checks.push({ name, status, message });
  results[status.toLowerCase()]++;
  checkItem(name, status, message);
}

/**
 * 1. Build Script 체크
 */
function checkBuildScript() {
  try {
    const packagePath = path.join(ROOT_DIR, 'package.json');
    if (!fs.existsSync(packagePath)) {
      addResult('Build Script', 'FAIL', 'package.json이 존재하지 않습니다.');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (!packageJson.scripts || !packageJson.scripts.build) {
      addResult('Build Script', 'FAIL', 'package.json에 "build" 스크립트가 없습니다.');
      return;
    }

    const buildScript = packageJson.scripts.build;
    if (!buildScript.includes('next build') && !buildScript.includes('vite build') && !buildScript.includes('build')) {
      addResult('Build Script', 'WARN', `build 스크립트가 의심스럽습니다: "${buildScript}"`);
      return;
    }

    addResult('Build Script', 'PASS', `"${buildScript}"`);
  } catch (error) {
    addResult('Build Script', 'FAIL', `에러: ${error.message}`);
  }
}

/**
 * 2. vercel.json 검증
 */
function checkVercelConfig() {
  try {
    const vercelConfigPath = path.join(ROOT_DIR, 'vercel.json');
    
    if (!fs.existsSync(vercelConfigPath)) {
      addResult('Vercel Config', 'PASS', 'vercel.json 없음 (기본 설정 사용)');
      return;
    }

    const configContent = fs.readFileSync(vercelConfigPath, 'utf8');
    
    // JSON 파싱 검증
    try {
      const config = JSON.parse(configContent);
      
      // ignoreCommand 체크 (항목 6과 통합)
      if (config.git?.ignoreCommand) {
        addResult('Vercel Config', 'WARN', `ignoreCommand가 설정되어 있습니다: "${config.git.ignoreCommand}"`);
        return;
      }
      
      addResult('Vercel Config', 'PASS', 'vercel.json 유효');
    } catch (parseError) {
      addResult('Vercel Config', 'FAIL', `JSON 파싱 오류: ${parseError.message}`);
    }
  } catch (error) {
    addResult('Vercel Config', 'FAIL', `에러: ${error.message}`);
  }
}

/**
 * 3. 의존성 오디트
 */
function checkDependencies() {
  try {
    const packagePath = path.join(ROOT_DIR, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // node_modules 체크
    const nodeModulesPath = path.join(ROOT_DIR, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      addResult('Dependencies', 'WARN', 'node_modules가 없습니다. npm install을 실행하세요.');
      return;
    }

    // package-lock.json 체크
    const lockfilePath = path.join(ROOT_DIR, 'package-lock.json');
    if (!fs.existsSync(lockfilePath)) {
      addResult('Dependencies', 'WARN', 'package-lock.json이 없습니다. 의존성 버전이 고정되지 않았습니다.');
      return;
    }

    // engines 체크
    if (packageJson.engines) {
      const nodeVersion = packageJson.engines.node;
      if (nodeVersion) {
        addResult('Dependencies', 'PASS', `Node.js 버전 제약: ${nodeVersion}`);
      }
    } else {
      addResult('Dependencies', 'PASS', 'engines 제약 없음');
    }
  } catch (error) {
    addResult('Dependencies', 'FAIL', `에러: ${error.message}`);
  }
}

/**
 * 4. 환경 변수 체크
 */
function checkEnvVars() {
  try {
    const envExamplePath = path.join(ROOT_DIR, '.env.example');
    const envLocalPath = path.join(ROOT_DIR, '.env.local');
    
    if (fs.existsSync(envExamplePath)) {
      const envExample = fs.readFileSync(envExamplePath, 'utf8');
      const requiredVars = envExample
        .split('\n')
        .filter(line => line && !line.startsWith('#'))
        .map(line => line.split('=')[0].trim())
        .filter(v => v);

      if (requiredVars.length > 0) {
        addResult('Environment Variables', 'WARN', 
          `${requiredVars.length}개 환경 변수 필요. Vercel에서 설정했는지 확인하세요: ${requiredVars.slice(0, 3).join(', ')}${requiredVars.length > 3 ? '...' : ''}`);
        return;
      }
    }

    addResult('Environment Variables', 'PASS', '환경 변수 템플릿 없음');
  } catch (error) {
    addResult('Environment Variables', 'WARN', `에러: ${error.message}`);
  }
}

/**
 * 5. 빌드 크기 제한 체크
 */
function checkBuildLimits() {
  try {
    const nodeModulesPath = path.join(ROOT_DIR, 'node_modules');
    
    if (!fs.existsSync(nodeModulesPath)) {
      addResult('Build Size', 'PASS', 'node_modules 없음 (크기 체크 생략)');
      return;
    }

    // node_modules 크기 계산 (대략적)
    let totalSize = 0;
    let fileCount = 0;
    const MAX_SIZE = 1024 * 1024 * 1024; // 1GB
    const WARN_SIZE = 500 * 1024 * 1024; // 500MB

    function getDirectorySize(dirPath) {
      if (fileCount > 10000) return; // 성능을 위해 제한
      
      try {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          try {
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
              getDirectorySize(filePath);
            } else {
              totalSize += stats.size;
              fileCount++;
            }
          } catch (e) {
            // 권한 오류 등 무시
          }
        }
      } catch (e) {
        // 디렉토리 읽기 오류 무시
      }
    }

    getDirectorySize(nodeModulesPath);

    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);

    if (totalSize > MAX_SIZE) {
      addResult('Build Size', 'FAIL', `node_modules가 너무 큽니다: ${sizeMB}MB (제한: 1GB)`);
    } else if (totalSize > WARN_SIZE) {
      addResult('Build Size', 'WARN', `node_modules 크기: ${sizeMB}MB (500MB 초과)`);
    } else {
      addResult('Build Size', 'PASS', `node_modules 크기: ${sizeMB}MB`);
    }
  } catch (error) {
    addResult('Build Size', 'WARN', `크기 체크 실패: ${error.message}`);
  }
}

/**
 * 6. Ignored Steps 감지 (vercel.json 체크에 통합됨)
 */
function checkIgnoredSteps() {
  try {
    const vercelConfigPath = path.join(ROOT_DIR, 'vercel.json');
    
    if (!fs.existsSync(vercelConfigPath)) {
      addResult('Ignored Steps', 'PASS', 'ignoreCommand 없음');
      return;
    }

    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    
    if (config.git?.ignoreCommand) {
      addResult('Ignored Steps', 'WARN', 
        `ignoreCommand 설정됨: "${config.git.ignoreCommand}". 빌드가 스킵될 수 있습니다.`);
    } else {
      addResult('Ignored Steps', 'PASS', 'ignoreCommand 없음');
    }
  } catch (error) {
    addResult('Ignored Steps', 'PASS', 'vercel.json 없음');
  }
}

/**
 * 7. Git 권한 체크
 */
function checkGitPermissions() {
  try {
    // .git 폴더 존재 확인
    const gitPath = path.join(ROOT_DIR, '.git');
    if (!fs.existsSync(gitPath)) {
      addResult('Git Permissions', 'WARN', 'Git 저장소가 아닙니다.');
      return;
    }

    // 현재 브랜치 확인
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { 
        cwd: ROOT_DIR,
        encoding: 'utf8' 
      }).trim();
      
      // 마지막 커밋 정보
      const lastCommit = execSync('git log -1 --pretty=format:"%an <%ae>"', {
        cwd: ROOT_DIR,
        encoding: 'utf8'
      }).trim();

      addResult('Git Permissions', 'PASS', `브랜치: ${branch}, 마지막 커밋: ${lastCommit}`);
    } catch (gitError) {
      addResult('Git Permissions', 'WARN', 'Git 명령 실행 실패');
    }
  } catch (error) {
    addResult('Git Permissions', 'WARN', `에러: ${error.message}`);
  }
}

/**
 * 8. 캐시 사용량 체크
 */
function checkCacheUsage() {
  try {
    const nextCachePath = path.join(ROOT_DIR, '.next', 'cache');
    
    if (!fs.existsSync(nextCachePath)) {
      addResult('Cache Usage', 'PASS', '.next/cache 없음');
      return;
    }

    // 캐시 크기 계산
    let cacheSize = 0;
    function getCacheSize(dirPath) {
      try {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          try {
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
              getCacheSize(filePath);
            } else {
              cacheSize += stats.size;
            }
          } catch (e) {
            // 무시
          }
        }
      } catch (e) {
        // 무시
      }
    }

    getCacheSize(nextCachePath);

    const sizeMB = (cacheSize / (1024 * 1024)).toFixed(2);
    const MAX_CACHE = 1024; // 1GB

    if (sizeMB > MAX_CACHE) {
      addResult('Cache Usage', 'WARN', `캐시 크기: ${sizeMB}MB (1GB 초과)`);
    } else {
      addResult('Cache Usage', 'PASS', `캐시 크기: ${sizeMB}MB`);
    }
  } catch (error) {
    addResult('Cache Usage', 'PASS', '캐시 체크 생략');
  }
}

/**
 * 9. 빌드 시간 예측
 */
function checkBuildTime() {
  try {
    log('\n빌드 시뮬레이션을 건너뜁니다 (시간 절약).', colors.yellow);
    log('실제 빌드 테스트는 "npm run build"를 실행하세요.', colors.yellow);
    addResult('Build Time', 'PASS', '시뮬레이션 생략 (수동 테스트 권장)');
  } catch (error) {
    addResult('Build Time', 'WARN', `에러: ${error.message}`);
  }
}

/**
 * 10. 빌드 출력 검증
 */
function checkBuildOutput() {
  try {
    const nextBuildPath = path.join(ROOT_DIR, '.next');
    
    if (!fs.existsSync(nextBuildPath)) {
      addResult('Build Output', 'WARN', '.next 폴더가 없습니다. 빌드를 실행해보세요.');
      return;
    }

    // 주요 빌드 파일 체크
    const buildManifest = path.join(nextBuildPath, 'build-manifest.json');
    if (fs.existsSync(buildManifest)) {
      addResult('Build Output', 'PASS', '.next 빌드 출력 존재');
    } else {
      addResult('Build Output', 'WARN', '.next 폴더가 불완전할 수 있습니다.');
    }
  } catch (error) {
    addResult('Build Output', 'WARN', `에러: ${error.message}`);
  }
}

/**
 * 설정 파일 로드
 */
function loadConfig() {
  const configPath = path.join(ROOT_DIR, '.predeployrc');
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      log(`⚠ .predeployrc 파싱 오류: ${error.message}`, colors.yellow);
    }
  }
  return {};
}

/**
 * 메인 실행 함수
 */
async function main() {
  const startTime = Date.now();
  
  header('🚀 Vercel 배포 전 체크리스트');
  
  log(`\n프로젝트: ${path.basename(ROOT_DIR)}`, colors.cyan);
  log(`경로: ${ROOT_DIR}`, colors.cyan);
  
  const config = loadConfig();
  if (config.skipChecks && config.skipChecks.length > 0) {
    log(`스킵된 체크: ${config.skipChecks.join(', ')}`, colors.yellow);
  }

  log('\n검사 시작...\n', colors.bright);

  // 모든 체크 실행
  checkBuildScript();
  checkVercelConfig();
  checkDependencies();
  checkEnvVars();
  checkBuildLimits();
  checkIgnoredSteps();
  checkGitPermissions();
  checkCacheUsage();
  checkBuildTime();
  checkBuildOutput();

  // 결과 요약
  header('📊 요약');
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  log(`\n✓ 통과: ${results.pass}`, colors.green);
  log(`⚠ 경고: ${results.warn}`, colors.yellow);
  log(`✗ 실패: ${results.fail}`, colors.red);
  log(`\n⏱ 실행 시간: ${duration}초\n`, colors.cyan);

  // 최종 판정
  if (results.fail > 0) {
    log('❌ 배포 전에 실패 항목을 수정해야 합니다.', colors.red);
    process.exit(1);
  } else if (results.warn > 0) {
    log('⚠️  경고가 있습니다. 확인 후 배포하세요.', colors.yellow);
  } else {
    log('✅ 모든 체크 통과! 배포 준비 완료.', colors.green);
  }

  // 다음 단계 제안
  log('\n다음 단계:', colors.bright);
  if (results.warn > 0 || results.fail > 0) {
    log('  1. 위의 경고/오류를 확인하세요.', colors.cyan);
    log('  2. 수정 후 다시 실행: npm run pre-deploy', colors.cyan);
  }
  log('  3. 로컬 빌드 테스트: npm run build', colors.cyan);
  log('  4. Vercel 배포: vercel build 또는 git push', colors.cyan);
  
  log('');
}

// 스크립트 실행
if (require.main === module) {
  main().catch(error => {
    log(`\n❌ 오류 발생: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };


