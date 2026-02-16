// frontend/src/lib/api.js
import { API_URL } from "./config.js";

async function jsonFetch(path, options = {}) {
  const r = await fetch(`${API_URL}${path}`, options);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "Error");
  return data;
}

export function getPosts() {
  return jsonFetch("/api/posts");
}

export function getPostBySlug(slug) {
  return jsonFetch(`/api/posts/${encodeURIComponent(slug)}`);
}

export function getCourses() {
  return jsonFetch("/api/courses");
}

export function getCourseBySlug(slug) {
  return jsonFetch(`/api/courses/${encodeURIComponent(slug)}`);
}
