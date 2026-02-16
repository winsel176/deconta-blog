import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RichEditor from "../components/RichEditor.jsx";
import { getToken, isLoggedIn, getUser } from "../lib/auth.js";
import { API_URL } from "../lib/config.js";

function slugify(input) {
  return (input || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const CATEGORIES = [
  "Presupuesto",
  "Ahorro",
  "Deudas",
  "Tarjetas de crédito",
  "Score / Historial crediticio",
  "Inversión básica",
  "Bancos en RD",
  "Impuestos (DGII)",
  "AFP y pensiones",
  "Seguros",
  "Emprendimiento",
  "Universitarios",
  "Bienes raíces",
  "Vehículos",
  "Consumo inteligente",
  "Fraudes y estafas",
  "Remesas",
  "Viajes y finanzas",
  "Tecnología y dinero",
  "Herramientas / Plantillas",
];

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=60";

export default function Write() {
  const nav = useNavigate();
  const me = getUser();

  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Presupuesto");
  const [coverImage, setCoverImage] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      nav("/login");
      return;
    }
  }, [nav]);

  useEffect(() => {
    if (!slug.trim() && title.trim()) setSlug(slugify(title));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const coverPreview = useMemo(() => {
    return coverImage?.trim() ? coverImage.trim() : DEFAULT_COVER;
  }, [coverImage]);

  async function publish() {
    if (!title.trim()) return alert("Falta el título");
    if (!slug.trim()) return alert("Falta el slug");
    if (!excerpt.trim()) return alert("Falta el extracto");
    if (!contentHtml.trim() || contentHtml === "<p></p>")
      return alert("Falta el contenido");

    try {
      setSaving(true);

      const r = await fetch(`${API_URL}/api/user/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          category,
          coverImage: coverImage?.trim() ? coverImage.trim() : "",
          content: contentHtml,
        }),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || "Error publicando");

      alert("Post publicado ✅");
      nav(`/blog/${data.slug}`);
    } catch (e) {
      alert(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 1040 }}>
      {/* Header */}
      <div className="card" style={{ padding: 18 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 className="h1" style={{ marginBottom: 6 }}>
              Crear post
            </h1>
            <p className="muted" style={{ margin: 0 }}>
              Publicando como <strong>@{me?.handle || "usuario"}</strong>
            </p>
            <p className="muted" style={{ marginTop: 8, maxWidth: 720 }}>
              Tip: usa títulos (H2/H3), listas y ejemplos. Mantén el extracto
              corto (2 líneas).
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={publish} disabled={saving}>
              {saving ? "Publicando…" : "Publicar"}
            </button>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="layout" style={{ marginTop: 14 }}>
        {/* Left */}
        <div style={{ display: "grid", gap: 14 }}>
          {/* Paso 1 */}
          <div className="card" style={{ padding: 16 }}>
            <h2 className="h2" style={{ marginTop: 0 }}>
              Paso 1 — Datos básicos
            </h2>

            <div className="muted" style={{ marginTop: 10 }}>
              Título
            </div>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Cómo ahorrar siendo estudiante en RD"
            />

            <div className="muted" style={{ marginTop: 12 }}>
              Slug (se genera solo, pero puedes editarlo)
            </div>
            <input
              className="input"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="como-ahorrar-siendo-estudiante-en-rd"
            />

            <div className="muted" style={{ marginTop: 12 }}>
              Extracto (2 líneas)
            </div>
            <textarea
              className="input"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Resumen rápido para que la gente haga click…"
            />
          </div>

          {/* Paso 2 */}
          <div className="card" style={{ padding: 16 }}>
            <h2 className="h2" style={{ marginTop: 0 }}>
              Paso 2 — Escribir el contenido
            </h2>
            <p className="muted" style={{ marginTop: 6 }}>
              Usa el editor como Word (títulos, negrita, listas, etc.).
            </p>

            <RichEditor value={contentHtml} onChange={setContentHtml} />
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "grid", gap: 14 }}>
          <div className="card" style={{ padding: 16 }}>
            <h2 className="h2" style={{ marginTop: 0 }}>
              Paso 3 — Detalles
            </h2>

            <div style={{ marginTop: 10 }}>
              <div className="muted">Categoría</div>
              <select
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 12 }}>
              <div className="muted">Imagen de portada (URL)</div>
              <input
                className="input"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://… (si lo dejas vacío, usa una por defecto)"
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <div className="muted" style={{ marginBottom: 8 }}>
                Preview
              </div>
              <div
                style={{
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "1px solid rgba(0,0,0,.06)",
                }}
              >
                <img
                  src={coverPreview}
                  alt="cover"
                  style={{ width: "100%", display: "block" }}
                />
              </div>
            </div>

            <div
              className="card"
              style={{ marginTop: 12, padding: 12, background: "rgba(0,0,0,.02)" }}
            >
              <div className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
                Checklist rápido:
                <ul style={{ marginTop: 8 }}>
                  <li>Título claro</li>
                  <li>Extracto corto</li>
                  <li>Secciones con H2</li>
                  <li>Ejemplos / listas</li>
                </ul>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                className="btn btn-primary"
                onClick={publish}
                disabled={saving}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {saving ? "Publicando…" : "Publicar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
