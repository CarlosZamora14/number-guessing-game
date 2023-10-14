const newGameForm = document.querySelector('.new-game-form');
let guessForm, timeout;

const PopupTypes = { ERROR: 0, SESSION_TIMEOUT: 1 };

function timeoutSetup(time) {
  if (timeout) clearTimeout(timeout);

  if (time !== null) {
    timeout = setTimeout(() => {
      const msg = 'Your session has expired. Please start a new game';
      clearGuessSection();
      showPopup(msg, PopupTypes.SESSION_TIMEOUT);
    }, time);
  }
}

function getUrlParams(form) {
  const formData = new FormData(form);
  const data = new URLSearchParams();

  for (const [key, value] of formData) {
    data.append(key, value);
  }

  return data;
}

function appendTemplate(templateSelector, containerSelector) {
  if ('content' in document.createElement('template')) {
    const template = document.querySelector(templateSelector);

    const clone = template.content.cloneNode(true);
    const container = document.querySelector(containerSelector);
    container.appendChild(clone);
    return true;
  }

  return false;
}

function clearGuessSection() {
  const section = document.querySelector('.guess-section');
  while (section.firstChild) {
    section.removeChild(section.firstChild);
  }
}

function showGuessSection() {
  clearGuessSection();
  if (appendTemplate('#guess-section-template', '.guess-section')) {
    guessForm = document.querySelector('.guess-form');
    guessForm.addEventListener('submit', submitGuessForm);
  }
}

function showVictorySection(number) {
  clearGuessSection();
  appendTemplate('#victory-section-template', '.guess-section');
  const paragraph = document.querySelector('.guess-section__number');
  paragraph.innerText = number;
}

function populateGameStatus(hintMsg, previousGuesses, done) {
  const previousGuessesElement = document.querySelector('.guess-section__game-status__previous-guesses');
  const hintElement = document.querySelector('.guess-section__game-status__hint');

  let previousGuessesText = previousGuesses.reduce((prev, curr, index) => {
    return (index === 0 ? `${prev} ${curr}` : `${prev}, ${curr}`);
  }, 'Previous guesses:');

  if (done) {
    hintElement.classList.remove('wrong');
  } else {
    hintElement.classList.add('wrong');
  }

  hintElement.innerText = hintMsg;
  previousGuessesElement.innerText = previousGuessesText;
}

function resetGameStatus() {
  const previousGuessesElement = document.querySelector('.guess-section__game-status__previous-guesses');
  const hintElement = document.querySelector('.guess-section__game-status__hint');

  hintElement.classList.remove('wrong');
  hintElement.innerText = '';
  previousGuessesElement.innerText = '';
}

function setDifficulty(min, max) {
  document.querySelector('.guess-section__paragraph .min').innerText = min;
  document.querySelector('.guess-section__paragraph .max').innerText = max;

  const inputElement = document.querySelector('.guess_form__input');
  inputElement.setAttribute('min', min);
  inputElement.setAttribute('max', max);
}

function closePopups() {
  const popups = document.querySelectorAll('.popup');
  popups.forEach(popup => document.body.removeChild(popup));
}

function showPopup(msg, type = PopupTypes.ERROR) {
  closePopups();
  if ('content' in document.createElement('template')) {
    const template = document.getElementById('popup-template');

    const clone = template.content.cloneNode(true);
    const popup = clone.querySelector('.popup');
    const message = clone.querySelector('.popup__message');
    const btn = clone.querySelector('.popup__escape-btn');

    switch (type) {
      case PopupTypes.ERROR:
        popup.classList.add('error');
        break;
      case PopupTypes.SESSION_TIMEOUT:
        popup.classList.add('timeout');
        break;
    }

    btn.addEventListener('click', closePopups);
    message.innerText = msg;

    document.body.appendChild(clone);
  } else {
    alert(msg);
  }
}

window.addEventListener('load', () => {
  fetch('/api/is-playing')
    .then(res => res.json())
    .then(data => {
      if (data.statusCode !== 200) {
        showPopup(data.msg);
      } else {
        if (data.isPlaying) {
          showGuessSection();
          setDifficulty(data.difficulty.min, data.difficulty.max);
          timeoutSetup(data.expirationTime - Date.now());
          if (data.previousGuesses.length) {
            populateGameStatus(data.lastMsg, data.previousGuesses);
          }
        }
      }
    }).catch(err => {
      showPopup(JSON.stringify(err.msg));
    });
});

document.addEventListener('keydown', evt => {
  if (evt.key === 'Escape') {
    closePopups();
  }
});

newGameForm.addEventListener('submit', evt => {
  evt.preventDefault();
  const data = getUrlParams(evt.target);

  fetch('/api/start-game', {
    method: 'POST',
    body: data
  }).then(res => res.json())
    .then(data => {
      if (data.statusCode !== 200) {
        showPopup(data.msg);
      } else {
        showGuessSection();
        timeoutSetup(data.expirationTime - Date.now());
        setDifficulty(data.difficulty.min, data.difficulty.max);
        resetGameStatus();
      }
    }).catch(err => {
      showPopup(JSON.stringify(err.msg));
    });
});

function submitGuessForm(evt) {
  evt.preventDefault();
  const data = getUrlParams(evt.target);

  fetch('/api/guess', {
    method: 'POST',
    body: data
  }).then(res => res.json())
    .then(data => {
      guessForm.reset();

      if (data.statusCode !== 200) {
        showPopup(data.msg);
      } else {
        if (data.done) {
          showVictorySection(data.previousGuesses.at(-1));
          timeoutSetup(null);
        } else {
          timeoutSetup(data.expirationTime - Date.now());
        }
        populateGameStatus(data.msg, data.previousGuesses, data.done);
      }
    }).catch(err => {
      showPopup(JSON.stringify(err.msg));
    });
};