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

window.addEventListener('load', () => {
  fetch('/api/is-playing')
    .then(res => res.json())
    .then(data => {
      console.log(data);
    }).catch(err => {
      console.error(err);
    });
});

newGameForm.addEventListener('submit', evt => {
  evt.preventDefault();
  const data = getUrlParams(evt.target);

  fetch('/api/start-game', {
    method: 'POST',
    body: data
  }).then(res => {
    return res.json();
  }).then(data => {
    console.log(data);
  }).catch(err => {
    console.error(err);
  });
});

guessForm.addEventListener('submit', evt => {
  evt.preventDefault();
  const data = getUrlParams(evt.target);

  fetch('/api/guess', {
    method: 'POST',
    body: data
  }).then(res => {
    return res.json();
  }).then(data => {
    console.log(data);
  }).catch(err => {
    console.error(err);
  });
});