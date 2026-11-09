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
 * Free ports if Node.js processes from previous runs are still running.
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
            log('ORCHESTRATOR', colors.yellow, `Previous process occupying port ${port} (PID: ${pid}) has been terminated.`);
          } catch {}
        }
      }
    }
  } catch {}
}

function runService(name, filterName, color) {
  log(name, color, `Starting ${name} service...`);

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
      log(name, colors.red, `Service stopped with error code ${code}.`);
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
  console.log(`${colors.yellow}${colors.bold}   🌸 Starting Nimoura Monorepo (Nimoura Dev Stack)${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}   Startup order: 1. Backend (4000) ← 2. Storefront (3000) ← 3. Admin (3001)${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}================================================================\n${colors.reset}`);

  // Clean up problematic TypeScript compiler cache files.
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

  // Free ports 4000, 3000, and 3001 if background processes are running.
  freePort(4000);
  freePort(3000);
  freePort(3001);

  // 1. Start the backend (NestJS on port 4000).
  log('ORCHESTRATOR', colors.yellow, 'Step 1 of 3: Starting the backend server (@nimoura/api) on port 4000...');
  runService('API', '@nimoura/api', colors.cyan);

  log('ORCHESTRATOR', colors.yellow, 'Waiting for TypeScript compilation and the backend health endpoint to become available...');
  const apiReady = await checkHttp('http://127.0.0.1:4000/api/v1/health', 35000);

  if (apiReady) {
    log('ORCHESTRATOR', colors.green, '✅ Backend server successfully started and responded on port 4000.');
  } else {
    log('ORCHESTRATOR', colors.yellow, 'Health check timed out. Continuing with web startup...');
  }

  await delay(1000);

  // 2. Start the main storefront (Nuxt 4 on port 3000).
  log('ORCHESTRATOR', colors.yellow, 'Step 2 of 3: Starting the main storefront (@nimoura/web) on port 3000...');
  runService('WEB', '@nimoura/web', colors.green);

  log('ORCHESTRATOR', colors.yellow, 'Waiting for the storefront server to build and load on port 3000...');
  const webReady = await checkHttp('http://127.0.0.1:3000', 30000);

  if (webReady) {
    log('ORCHESTRATOR', colors.green, '✅ Online store is now available at http://localhost:3000.');
  } else {
    log('ORCHESTRATOR', colors.yellow, 'Continuing with admin panel startup...');
  }

  await delay(1000);

  // 3. Start the admin panel (Nuxt 4 on port 3001).
  log('ORCHESTRATOR', colors.yellow, 'Step 3 of 3: Starting the admin panel (@nimoura/admin) on port 3001...');
  runService('ADMIN', '@nimoura/admin', colors.magenta);

  const adminReady = await checkHttp('http://127.0.0.1:3001', 30000);
  if (adminReady) {
    log('ORCHESTRATOR', colors.green, '✅ Admin panel is now available at http://localhost:3001.');
  }

  console.log(`\n${colors.green}${colors.bold}================================================================${colors.reset}`);
  console.log(`${colors.green}${colors.bold}   🎉 All services have been started in the specified order:${colors.reset}`);
  console.log(`${colors.cyan}   • Backend API:      http://localhost:4000/api/v1/health${colors.reset}`);
  console.log(`${colors.green}   • Web Storefront:   http://localhost:3000${colors.reset}`);
  console.log(`${colors.magenta}   • Admin Panel:      http://localhost:3001${colors.reset}`);
  console.log(`${colors.yellow}   • Exit and stop:    Ctrl + C${colors.reset}`);
  console.log(`${colors.green}${colors.bold}================================================================\n${colors.reset}`);
}

function cleanup() {
  console.log(`\n${colors.yellow}[ORCHESTRATOR] Gracefully stopping all services...${colors.reset}`);
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