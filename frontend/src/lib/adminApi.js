import { API_URL } from "./config.js";

function getToken() {
  return localStorage.getItem("ADMIN_TOKEN") || "";
}

export function setToken(token) {
  localStorage.setItem("ADMIN_TOKEN", token);
}

export function clearToken() {
  localStorage.removeItem("ADMIN_TOKEN");
}

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
    "x-admin-token": token,
  };

  const r = await fetch(`${API_URL}${path}`, { ...options, headers });

  let data = {};
  try {
    data = await r.json();
  } catch {
    data = {};
  }

  if (!r.ok) {
    throw new Error(data?.error || "Error");
  }
  return data;
}

// ====== Admin CRUD ======
export function adminListPosts() {
  return request("/api/admin/posts");
}

export function adminCreatePost(body) {
  return request("/api/admin/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function adminUpdatePost(id, body) {
  return request(`/api/admin/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function adminDeletePost(id) {
  return request(`/api/admin/posts/${id}`, { method: "DELETE" });
}

// ====== IA (extracto) ======
export async function adminGenerateExcerpt(title, content) {
  const r = await fetch(`${API_URL}/api/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Genera un extracto corto (máx 2 frases) para un blog.
Título: ${title}
Contenido: ${content}`,
    }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "Error");
  return data.reply || "";
}

// ====== IA (post completo) ======
export async function adminGenerateFullPost(topic, notes = "") {
  return request("/api/admin/ai/draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, notes }),
  });
}
