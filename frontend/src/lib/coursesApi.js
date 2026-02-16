import { API_URL } from "./config.js";
export async function getCourses() {
  const r = await fetch(`${API}/api/courses`);
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || "Error cargando cursos");
  return Array.isArray(data) ? data : [];
}

export async function getCourseBySlug(slug) {
  const r = await fetch(`${API}/api/courses/${encodeURIComponent(slug)}`);
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || "Error cargando curso");
  return data;
}
