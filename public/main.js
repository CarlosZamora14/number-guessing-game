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

function showPopup(msg) {
  if ('content' in document.createElement('template')) {
    const template = document.getElementById('popup-template');

    const clone = template.content.cloneNode(true);
    let text = clone.querySelector('p');
    text.textContent = msg;

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
      if (data.status !== 200) {
        showPopup(JSON.stringify(data.msg));
      }
    }).catch(err => {
      showPopup(JSON.stringify(err.msg));
    });
});

newGameForm.addEventListener('submit', evt => {
  evt.preventDefault();
  const data = getUrlParams(evt.target);

  fetch('/api/start-game', {
    method: 'POST',
    body: data
  }).then(res => res.json())
    .then(data => {
      console.log(data);
      if (data.status !== 200) {
        showPopup(JSON.stringify(data.msg));
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
      console.log(data);
      if (data.status !== 200) {
        showPopup(JSON.stringify(data.msg));
      }
    }).catch(err => {
      showPopup(JSON.stringify(err.msg));
    });
});

document.addEventListener('keydown', evt => {
  if (evt.key === 'Escape') {
    const popups = document.querySelectorAll('.popup__background');
    popups.forEach(popup => document.body.removeChild(popup));
  }
});