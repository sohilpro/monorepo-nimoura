import { spawn, execSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(tag, color, text) {
  const prefix = `${color}${colors.bold}[${tag}]${colors.reset} `;
  const lines = String(text).split('\n');
  for (const line of lines) {
    if (line.trim()) {
      console.log(`${prefix}${line}`);
    }
  }
}

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';
const children = [];

/**
 * آزادسازی پورت‌ها در صورت باز ماندن پروسه‌های نود از دفعات قبل
 */
function freePort(port) {
  if (!isWin) return;
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const lines = output.trim().split('\n');
    for (const line of lines) {
      if (line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && pid !== String(process.pid)) {
          try {
            execSync(`taskkill /pid ${pid} /f /t`, { stdio: 'ignore' });
            log('ORCHESTRATOR', colors.yellow, `پروسه قبلی اشغال‌کننده پورت ${port} (PID: ${pid}) بسته شد.`);
          } catch {}
        }
      }
    }
  } catch {}
}

function runService(name, filterName, color) {
  log(name, color, `در حال استارت سرویس ${name}...`);

  const proc = spawn(npmCmd, ['run', 'dev', `--workspace=${filterName}`], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: isWin,
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  children.push({ name, proc });

  proc.stdout.on('data', (chunk) => {
    log(name, color, chunk.toString());
  });

  proc.stderr.on('data', (chunk) => {
    log(name, color, chunk.toString());
  });

  proc.on('close', (code) => {
    if (code !== null && code !== 0) {
      log(name, colors.red, `سرویس با کد خطای ${code} متوقف شد.`);
    }
  });

  return proc;
}

function checkHttp(url, timeoutMs = 40000) {
  const startTime = Date.now();
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const req = http.get(url, (res) => {
        clearInterval(interval);
        req.destroy();
        resolve(true);
      });

      req.on('error', () => {
        req.destroy();
        if (Date.now() - startTime >= timeoutMs) {
          clearInterval(interval);
          resolve(false);
        }
      });
    }, 800);
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function start() {
  console.log(`\n${colors.yellow}${colors.bold}================================================================${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}   🌸 شروع اجرای مونو‌ریپو نیمورا (Nimoura Dev Stack)${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}   ترتیب قطعی: ۱. بکند (4000) ← ۲. فروشگاه (3000) ← ۳. ادمین (3001)${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}================================================================\n${colors.reset}`);

  // پاکسازی فایل‌های کش مخرب کامپایلر تایپ‌استریپت
  const buildInfoFiles = [
    path.resolve('apps/api/tsconfig.build.tsbuildinfo'),
    path.resolve('apps/api/tsconfig.tsbuildinfo'),
  ];
  for (const file of buildInfoFiles) {
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
      } catch {}
    }
  }

  // آزادسازی پورت‌های ۴۰۰۰، ۳۰۰۰ و ۳۰۰۱ در صورت وجود پروسه پس‌زمینه
  freePort(4000);
  freePort(3000);
  freePort(3001);

  // ۱. راه‌اندازی بکند (NestJS روی پورت 4000)
  log('ORCHESTRATOR', colors.yellow, 'مرحله ۱ از ۳: راه‌اندازی سرور بکند (@nimoura/api) روی پورت 4000...');
  runService('API', '@nimoura/api', colors.cyan);

  log('ORCHESTRATOR', colors.yellow, 'در حال انتظار برای کامپایل تایپ‌استریپت و بالا آمدن اندپوینت سلامت بکند...');
  const apiReady = await checkHttp('http://127.0.0.1:4000/api/v1/health', 35000);

  if (apiReady) {
    log('ORCHESTRATOR', colors.green, '✅ سرور بکند روی پورت 4000 با موفقیت فعال شد و پاسخ داد.');
  } else {
    log('ORCHESTRATOR', colors.yellow, 'زمان بررسی سلامت گذشت، ادامه راه‌اندازی وب...');
  }

  await delay(1000);

  // ۲. راه‌اندازی فروشگاه اصلی (Nuxt 4 روی پورت 3000)
  log('ORCHESTRATOR', colors.yellow, 'مرحله ۲ از ۳: راه‌اندازی فروشگاه اصلی (@nimoura/web) روی پورت 3000...');
  runService('WEB', '@nimoura/web', colors.green);

  log('ORCHESTRATOR', colors.yellow, 'در حال انتظار برای بیلد و لود سرور فروشگاه روی پورت 3000...');
  const webReady = await checkHttp('http://127.0.0.1:3000', 30000);

  if (webReady) {
    log('ORCHESTRATOR', colors.green, '✅ فروشگاه اینترنتی روی http://localhost:3000 فعال شد.');
  } else {
    log('ORCHESTRATOR', colors.yellow, 'ادامه راه‌اندازی پنل ادمین...');
  }

  await delay(1000);

  // ۳. راه‌اندازی پنل مدیریت (Nuxt 4 روی پورت 3001)
  log('ORCHESTRATOR', colors.yellow, 'مرحله ۳ از ۳: راه‌اندازی پنل مدیریت (@nimoura/admin) روی پورت 3001...');
  runService('ADMIN', '@nimoura/admin', colors.magenta);

  const adminReady = await checkHttp('http://127.0.0.1:3001', 30000);
  if (adminReady) {
    log('ORCHESTRATOR', colors.green, '✅ پنل ادمین روی http://localhost:3001 فعال شد.');
  }

  console.log(`\n${colors.green}${colors.bold}================================================================${colors.reset}`);
  console.log(`${colors.green}${colors.bold}   🎉 تمام سرویس‌ها با ترتیب مشخص فعال شدند:${colors.reset}`);
  console.log(`${colors.cyan}   • بکند API:      http://localhost:4000/api/v1/health${colors.reset}`);
  console.log(`${colors.green}   • فروشگاه وب:    http://localhost:3000${colors.reset}`);
  console.log(`${colors.magenta}   • پنل مدیریت:    http://localhost:3001${colors.reset}`);
  console.log(`${colors.yellow}   • خروج و بستن:   Ctrl + C${colors.reset}`);
  console.log(`${colors.green}${colors.bold}================================================================\n${colors.reset}`);
}

function cleanup() {
  console.log(`\n${colors.yellow}[ORCHESTRATOR] در حال توقف تمیز تمام سرویس‌ها...${colors.reset}`);
  for (const { name, proc } of children) {
    try {
      if (isWin) {
        spawn('taskkill', ['/pid', String(proc.pid), '/f', '/t']);
      } else {
        proc.kill('SIGINT');
      }
    } catch {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

start();
