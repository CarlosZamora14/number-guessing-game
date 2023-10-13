const newGameForm = document.querySelector('.new-game-form');
const guessForm = document.querySelector('.guess-form');

function getUrlParams(form) {
  const formData = new FormData(form);
  const data = new URLSearchParams();

  for (const [key, value] of formData) {
    data.append(key, value);
  }

  return data;
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
}

function closePopups() {
  const popups = document.querySelectorAll('.popup');
  popups.forEach(popup => document.body.removeChild(popup));
}

function showPopup(msg) {
  if ('content' in document.createElement('template')) {
    const template = document.getElementById('popup-template');

    const clone = template.content.cloneNode(true);
    const message = clone.querySelector('.popup__message');
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
      console.log(data);
      if (data.statusCode !== 200) {
        showPopup(data.msg);
      } else {
        console.log(data);
        if (data.isPlaying) {
          setDifficulty(data.difficulty.min, data.difficulty.max);
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
        console.log(typeof data.statusCode);
        showPopup(data.msg);
      } else {
        console.log(data);
        resetGameStatus();
      }
    }).catch(err => {
      showPopup(JSON.stringify(err.msg));
    });
});

guessForm.addEventListener('submit', evt => {
  evt.preventDefault();
  const data = getUrlParams(evt.target);

  fetch('/api/guess', {
    method: 'POST',
    body: data
  }).then(res => res.json())
    .then(data => {
      if (data.statusCode !== 200) {
        showPopup(data.msg);
      } else {
        guessForm.reset();
        console.log(data);
        populateGameStatus(data.msg, data.previousGuesses, data.done);
      }
    }).catch(err => {
      showPopup(JSON.stringify(err.msg));
    });
});