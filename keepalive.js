const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'dev.log');

function startServer() {
  const logStream = fs.openSync(logFile, 'a');
  const child = spawn('npx', ['next', 'dev', '-p', '3000'], {
    stdio: ['ignore', logStream, logStream],
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
    detached: false,
  });

  console.log(`[keepalive] Started Next.js dev server (PID: ${child.pid})`);

  child.on('exit', (code, signal) => {
    const now = new Date().toISOString();
    console.log(`[keepalive] Server exited with code ${code}, signal ${signal} at ${now}. Restarting in 3s...`);
    fs.appendFileSync(logFile, `\n[keepalive] Server exited (code: ${code}, signal: ${signal}) at ${now}. Restarting...\n`);
    setTimeout(startServer, 3000);
  });

  child.on('error', (err) => {
    console.error(`[keepalive] Error: ${err.message}`);
    setTimeout(startServer, 5000);
  });
}

startServer();
