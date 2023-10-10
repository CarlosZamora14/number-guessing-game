function parseCookies(request) {
  const list = {};
  const cookieHeader = request.headers?.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });

  return list;
}

function setCookie(response, cookieName, cookieValue, maxAge) {
  response.setHeader('Set-Cookie', [
    `${cookieName}=${encodeURIComponent(cookieValue)}`,
    `Max-Age=${maxAge}`,
    'Secure',
  ].join('; '));
}

function deleteCookie(response, cookieName) {
  response.setHeader('Set-Cookie', [
    `${cookieName}=''`,
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'Secure',
  ].join('; '));
}

module.exports = { parseCookies, setCookie, deleteCookie };