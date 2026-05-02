// Minimal keepalive server — single process, loads .env.local, restarts on crash
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && key.trim() && !key.startsWith('#')) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  });
}

// Force SQLite
process.env.TURSO_DATABASE_URL = '';
process.env.TURSO_AUTH_TOKEN = '';
process.env.PORT = '3000';

function start() {
  const child = spawn(process.execPath, ['.next/standalone/server.js'], {
    cwd: __dirname,
    stdio: ['inherit', 'inherit', 'inherit'],
    env: { ...process.env },
  });
  
  child.on('exit', (code) => {
    console.log(`[keepalive] Server exited (code: ${code}), restarting in 3s...`);
    setTimeout(start, 3000);
  });
  
  child.on('error', (err) => {
    console.error('[keepalive] Spawn error:', err.message);
    setTimeout(start, 3000);
  });
}

console.log('[keepalive] Starting GALAXY 3GSP server...');
start();
