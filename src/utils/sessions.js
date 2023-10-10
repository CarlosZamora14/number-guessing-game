const sessions = new Map();

function createSession(sessionId, number, expirationTime) {
  if (!sessionId || sessions.has(sessionId)) {
    return false;
  }

  const session = {
    expirationTime: expirationTime,
    gameState: {
      guesses: [],
      number: number
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

function cleanup() {
  sessions.forEach((session, key) => {
    if (session.expirationTime < Date.now()) {
      sessions.delete(key);
    }
  });
}

module.exports = { sessions, createSession, updateGameState, cleanup };