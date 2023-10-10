const crypto = require('crypto');
const { parseCookies, deleteCookie, setCookie } = require('../utils/cookie-handler.js');
const { generateNumber } = require('../utils/get-number.js');
const {
  isSessionActive,
  getPreviousGuesses,
  createSession,
  updateGameState,
  hasWon,
  deleteSession,
} = require('../utils/sessions.js');

const numberPattern = /^[0-9]+$/;
const sessionTimeout = 60 * 15; // 15 minutes
const sessionTimeoutInMilliseconds = 3600 * 60 * 15;
const difficulties = {
  'easy': { min: 1, max: 10 },
  'medium': { min: 1, max: 100 },
  'hard': { min: 1, max: 1000 },
};

function isPlaying(request, response) {
  const cookies = parseCookies(request);
  const isPlaying = cookies.hasOwnProperty('session-id') && isSessionActive(cookies['session-id']);

  const data = { isPlaying };
  if (isPlaying) {
    data.previousGuesses = getPreviousGuesses(cookies['session-id']);
  }

  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(data));
}

function resetGame(request, response) {
  const cookies = parseCookies(request);
  if (cookies.hasOwnProperty('session-id')) {
    deleteCookie(response, 'session-id');
    deleteSession(cookies['session-id']);
  }
}

function startGame(request, response, body) {
  resetGame(request, response);

  const urlParams = new URLSearchParams(body);
  const difficulty = urlParams.get('difficulty').trim().toLowerCase();

  if (!difficulties[difficulty]) {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ msg: 'Invalid difficulty' }));
  } else {
    const { min, max } = difficulties[difficulty];
    const sessionId = crypto.randomUUID();
    const number = generateNumber(min, max);

    setCookie(response, 'session-id', sessionId, sessionTimeout);
    createSession(sessionId, number, Date.now() + sessionTimeoutInMilliseconds);
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ msg: 'Game started successfully' }));
  }
}

function guess(request, response, body) {
  const cookies = parseCookies(request);

  if (cookies.hasOwnProperty('session-id') && isSessionActive(cookies['session-id'])) {
    const urlParams = new URLSearchParams(body);
    let guess = urlParams.get('guess').trim();

    if (!guess.match(numberPattern)) {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      return response.end(JSON.stringify({ msg: 'Not a valid number. Try again' }));
    }

    updateGameState(cookies['session-id'], parseInt(guess, 10), sessionTimeoutInMilliseconds);

    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    let msg, sign = hasWon(cookies['session-id'], guess);
    const previousGuesses = getPreviousGuesses(cookies['session-id']);

    if (sign !== 0) {
      msg = `Wrong! Your guess was too ${sign < 0 ? 'low' : 'high'}`;
    } else {
      msg = `You guessed the correct number in ${previousGuesses.length} tries`;
      resetGame(request, response);
    }

    response.end(JSON.stringify({ msg, previousGuesses }));
  } else {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ msg: 'Please start a new game' }));
  }
}

module.exports = { startGame, isPlaying, guess };