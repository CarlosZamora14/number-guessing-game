const sessions = new Map();

function createSession(sessionId, number, expirationTime, difficulty) {
  if (!sessionId || sessions.has(sessionId)) {
    return false;
  }

  const session = {
    expirationTime: expirationTime,
    gameState: {
      guesses: [],
      number: number,
      difficulty: difficulty
    }
  };

  sessions.set(sessionId, session);
  return true;
}

function updateGameState(sessionId, guess, sessionTimeout) {
  if (!(sessionId && sessions.has(sessionId) && sessions.get(sessionId).expirationTime > Date.now())) {
    return false;
  }

  const session = sessions.get(sessionId);
  session.expirationTime = Date.now() + sessionTimeout;
  session.gameState.guesses.push(guess);
  return true;
}

function hasWon(sessionId, guess) {
  return (guess - sessions.get(sessionId).gameState.number);
}

function getPreviousGuesses(sessionId) {
  if (!(sessionId && sessions.has(sessionId))) {
    return null;
  }

  return sessions.get(sessionId).gameState.guesses;
}

function getGameDifficulty(sessionId) {
  if (!(sessionId && sessions.has(sessionId))) {
    return null;
  }

  return sessions.get(sessionId).gameState.difficulty;
}

function hasKey(sessionId) {
  return (sessionId && sessions.has(sessionId));
}

function isSessionActive(sessionId) {
  return (hasKey(sessionId) && sessions.get(sessionId).expirationTime > Date.now());
}

function deleteSession(sessionId) {
  return sessions.delete(sessionId);
}

function cleanup() {
  sessions.forEach((session, key) => {
    if (session.expirationTime < Date.now()) {
      sessions.delete(key);
    }
  });
}

module.exports = {
  getPreviousGuesses,
  createSession,
  updateGameState,
  cleanup,
  deleteSession,
  isSessionActive,
  hasWon,
  getGameDifficulty
};