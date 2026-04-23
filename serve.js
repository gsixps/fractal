const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = 3000;
const STATIC_DIR = path.join(__dirname, '.next', 'static');
const SERVER_DIR = path.join(__dirname, '.next', 'server', 'app');
const INDEX_HTML = path.join(SERVER_DIR, 'index.html');

const MIME = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
};

function sendFile(filePath, res, compress = false) {
  try {
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath);
    const mime = MIME[ext] || 'application/octet-stream';
    
    if (compress && data.length > 1024) {
      res.writeHead(200, {
        'Content-Type': mime,
        'Content-Encoding': 'gzip',
        'Cache-Control': 'public, max-age=31536000, immutable',
      });
      zlib.gzip(data, (err, compressed) => {
        if (err) { res.end(data); return; }
        res.end(compressed);
      });
    } else {
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
      });
      res.end(data);
    }
    return true;
  } catch (e) { return false; }
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  const method = req.method;
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Static files (_next/static/*)
  if (url.startsWith('/_next/static/') || url.startsWith('/_next/media/')) {
    const filePath = path.join(STATIC_DIR, url.replace('/_next/', ''));
    if (sendFile(filePath, res, true)) return;
  }
  
  // Serve index.html for all page routes (SPA)
  if (method === 'GET' && !url.startsWith('/api/')) {
    if (sendFile(INDEX_HTML, res)) return;
  }
  
  // API routes
  if (url.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    
    // Return seed assets for /api/assets
    if (url === '/api/assets' || url === '/api/assets/') {
      try {
        const seedData = require('./src/lib/seed-data');
        res.end(JSON.stringify(seedData.SEED_ASSETS || []));
      } catch (e) {
        res.end('[]');
      }
      return;
    }
    
    // Return empty arrays for other API routes
    res.end('[]');
    return;
  }
  
  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Handle process errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught:', err.message);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`GSP Static Server running on http://0.0.0.0:${PORT}`);
});
