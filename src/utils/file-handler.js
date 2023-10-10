const path = require('path');
const fs = require('fs');

const publicFolder = 'public';
const assetPattern = /^\/[a-z0-9]+(-[a-z0-9]+)*.[a-z]+$/i;
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
};

function parseUrl(url) {
  let [pathname, ...rest] = url.split('?');
  if (pathname === '/') pathname = '/index.html';

  if (pathname.match(assetPattern)) {
    const filePath = path.join(publicFolder, pathname);
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    return { filePath, contentType };
  }

  return {};
}

function staticFileHandler(request, response, filePath, contentType, statusCodeOnSuccess = 200) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        const { filePath: notFoundPagePath, contentType: notFoundPagecontentType } = parseUrl('/404.html');
        staticFileHandler(request, response, notFoundPagePath, notFoundPagecontentType, 404);
      } else {
        response.writeHead(500);
        response.end(`Sorry, check with the site admin for error: ${err.code}`);
      }
    } else {
      response.writeHead(statusCodeOnSuccess, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });
}

function requestListener(request, response) {
  const { filePath, contentType } = parseUrl(request.url);
  staticFileHandler(request, response, filePath ?? '', contentType ?? '');
};

module.exports = { requestListener };