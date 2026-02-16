const KEY_T = "DECONTA_TOKEN";
const KEY_U = "DECONTA_USER";

export function getToken() {
  return localStorage.getItem(KEY_T) || "";
}

export function getUser() {
  const raw = localStorage.getItem(KEY_U);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function setAuth(token, user) {
  localStorage.setItem(KEY_T, token);
  localStorage.setItem(KEY_U, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(KEY_T);
  localStorage.removeItem(KEY_U);
}

export function isLoggedIn() {
  return !!getToken();
}
