const http = require('http');
const { requestListener } = require('./utils/file-handler.js');
const { startGame, isPlaying, guess } = require('./controllers/apiController.js');
const { cleanup } = require('./utils/sessions.js');

const app = http.createServer((req, res) => {
  if (req.method === 'POST') {
    req.setEncoding('utf-8');
    let body = '';

    req.on('data', data => {
      body += data;
    });

    req.on('end', () => {
      if (req.url === '/api/start-game') {
        startGame(req, res, body);
      } else if (req.url === '/api/guess') {
        guess(req, res, body);
      }
    });
  } else if (req.method === 'GET') {
    if (req.url === '/api/is-playing') {
      isPlaying(req, res);
    } else {
      requestListener(req, res);
    }
  }

  cleanup();
});

module.exports = { app };