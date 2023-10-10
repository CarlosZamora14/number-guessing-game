function generateNumber(start = 1, end = 10) {
  const number = Math.floor(Math.random() * (end - start + 1) + start);
  return number;
}

module.exports = { generateNumber };