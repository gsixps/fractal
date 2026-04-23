const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'dev.log');
const isProduction = process.env.PRODUCTION === 'true';

function startServer() {
  // Clear previous log on fresh start
  if (!global._restarting) {
    fs.writeFileSync(logFile, '');
  }
  global._restarting = true;
  
  const logStream = fs.openSync(logFile, 'a');
  const cmd = isProduction 
    ? 'node' 
    : 'npx';
  const args = isProduction
    ? [path.join(__dirname, '.next/standalone/server.js')]
    : ['next', 'dev', '-p', '3000'];
  
  const child = spawn(cmd, args, {
    stdio: ['ignore', logStream, logStream],
    env: { 
      ...process.env, 
      NODE_OPTIONS: '--max-old-space-size=2048',
      PORT: '3000',
    },
    detached: false,
  });

  console.log(`[keepalive] Started server (PID: ${child.pid})`);

  child.on('exit', (code, signal) => {
    const now = new Date().toISOString();
    const msg = `[keepalive] Server exited (code: ${code}, signal: ${signal}) at ${now}. Restarting in 3s...\n`;
    console.log(msg);
    fs.appendFileSync(logFile, msg);
    setTimeout(startServer, 3000);
  });

  child.on('error', (err) => {
    const msg = `[keepalive] Error: ${err.message}. Restarting in 5s...\n`;
    console.error(msg);
    fs.appendFileSync(logFile, msg);
    setTimeout(startServer, 5000);
  });
}

startServer();
