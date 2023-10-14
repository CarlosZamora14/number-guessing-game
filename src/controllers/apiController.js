const crypto = require('crypto');
const { parseCookies, deleteCookie, setCookie } = require('../utils/cookie-handler.js');
const { generateNumber } = require('../utils/get-number.js');
const {
  isSessionActive,
  getPreviousGuesses,
  getGameDifficulty,
  createSession,
  updateGameState,
  hasWon,
  deleteSession,
  getExpirationTime,
} = require('../utils/sessions.js');

const numberPattern = /^[0-9]+$/;
const sessionTimeout = 60 * 15; // 15 minutes
const sessionTimeoutInMilliseconds = 1000 * sessionTimeout;
const difficulties = {
  'easy': { min: 1, max: 10 },
  'medium': { min: 1, max: 100 },
  'hard': { min: 1, max: 1000 },
};

function isPlaying(request, response) {
  const cookies = parseCookies(request);
  const isPlaying = cookies.hasOwnProperty('session-id') && isSessionActive(cookies['session-id']);

  const data = { isPlaying, statusCode: 200 };
  if (isPlaying) {
    data.previousGuesses = getPreviousGuesses(cookies['session-id']);
    data.difficulty = getGameDifficulty(cookies['session-id']);
    data.expirationTime = getExpirationTime(cookies['session-id']);
    if (data.previousGuesses.length) {
      const sign = hasWon(cookies['session-id'], data.previousGuesses.at(-1));
      data.lastMsg = `Wrong! Your guess was too ${sign < 0 ? 'low' : 'high'}`;
    }
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
    response.end(JSON.stringify({ statusCode: 400, msg: 'Invalid difficulty' }));
  } else {
    const { min, max } = difficulties[difficulty];
    const sessionId = crypto.randomUUID();
    const number = generateNumber(min, max);
    const expirationTime = Date.now() + sessionTimeoutInMilliseconds;

    setCookie(response, 'session-id', sessionId, sessionTimeout);
    createSession(sessionId, number, expirationTime, difficulties[difficulty]);
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ statusCode: 200, msg: 'Game started successfully', difficulty: { min, max }, expirationTime }));
  }
}

function guess(request, response, body) {
  const cookies = parseCookies(request);

  if (cookies.hasOwnProperty('session-id') && isSessionActive(cookies['session-id'])) {
    const urlParams = new URLSearchParams(body);
    let guess = urlParams.get('guess').trim();

    if (!guess.match(numberPattern)) {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      return response.end(JSON.stringify({ statusCode: 400, msg: 'Not a valid number. Try again' }));
    }

    updateGameState(cookies['session-id'], parseInt(guess, 10), sessionTimeoutInMilliseconds);

    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    let msg, done = false, sign = hasWon(cookies['session-id'], guess);
    const previousGuesses = getPreviousGuesses(cookies['session-id']);
    const expirationTime = getExpirationTime(cookies['session-id']);

    if (sign !== 0) {
      msg = `Wrong! Your guess was too ${sign < 0 ? 'low' : 'high'}`;
    } else {
      done = true;
      msg = `You guessed the correct number in ${previousGuesses.length} tries`;
      resetGame(request, response);
    }

    response.end(JSON.stringify({ statusCode: 200, msg, previousGuesses, done, expirationTime }));
  } else {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ statusCode: 400, msg: 'Please start a new game' }));
  }
}

module.exports = { startGame, isPlaying, guess };