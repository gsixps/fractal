const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const NEXT_STATIC = path.join(__dirname, '.next', 'static');
const NEXT_SERVER = path.join(__dirname, '.next', 'server');
const STANDALONE = path.join(__dirname, '.next', 'standalone', '.next', 'static');

const mimeTypes = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function serveStatic(filePath, res) {
  // Try multiple locations
  const locations = [
    path.join(NEXT_STATIC, filePath),
    path.join(STANDALONE, filePath),
    path.join(NEXT_SERVER, filePath),
  ];
  
  for (const loc of locations) {
    try {
      if (fs.existsSync(loc) && fs.statSync(loc).isFile()) {
        const ext = path.extname(loc);
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(loc).pipe(res);
        return true;
      }
    } catch (e) {}
  }
  return false;
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  
  // Serve static files
  if (url.startsWith('/_next/static/') || url.startsWith('/_next/media/')) {
    const filePath = url.replace('/_next/', '');
    if (serveStatic(filePath, res)) return;
  }
  
  // Serve pre-rendered HTML for all page routes
  const htmlPath = path.join(NEXT_SERVER, 'app', 'index.html');
  if (fs.existsSync(htmlPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(htmlPath).pipe(res);
    return;
  }
  
  // API routes - return empty data (frontend uses seed data)
  if (url.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([]));
    return;
  }
  
  // Fallback
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Mini server running on http://0.0.0.0:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err.message);
});
