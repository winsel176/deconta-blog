import { useEffect, useState } from "react";
import { adminGenerateExcerpt, adminGenerateFullPost } from "../lib/adminApi.js";

function slugify(input) {
  return (input || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .replace(/[^a-z0-9\s-]/g, "") // quitar símbolos
    .replace(/\s+/g, "-") // espacios a guiones
    .replace(/-+/g, "-"); // múltiples guiones
}

export default function AdminPostForm({ initial, onSave, saving }) {
  const [form, setForm] = useState({
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    category: "Presupuesto",
    authorName: "Deconta",
    authorHandle: "deconta",
    coverImage: "",
    published: true,
    ...initial,
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");

  function set(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  // ✅ Slug automático (solo si el usuario no ha escrito uno)
  useEffect(() => {
    if (!form.slug.trim() && form.title.trim()) {
      set("slug", slugify(form.title));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

  async function generateExcerpt() {
    if (!form.title.trim() || !form.content.trim()) {
      alert("Primero escribe Título y Contenido.");
      return;
    }
    try {
      setAiLoading(true);
      const reply = await adminGenerateExcerpt(form.title, form.content);
      set("excerpt", String(reply).trim().replace(/^"|"$/g, ""));
    } catch (e) {
      alert(e?.message || "Error generando extracto");
    } finally {
      setAiLoading(false);
    }
  }

async function generateFullPost() {
  if (!topic.trim()) {
    alert("Escribe el tema primero.");
    return;
  }

  try {
    setAiLoading(true);

    // ✅ AHORA DEVUELVE OBJETO (no string)
    const obj = await adminGenerateFullPost(topic, notes);

    if (obj.title) set("title", obj.title);
    if (obj.slug) set("slug", slugify(obj.slug));
    if (obj.excerpt) set("excerpt", obj.excerpt);
    if (obj.category) set("category", obj.category);
    if (obj.content) set("content", obj.content);

    // si no devolvió slug, lo derivamos del título
    if (!obj.slug && obj.title) set("slug", slugify(obj.title));
  } catch (e) {
    alert(e?.message || "Error generando post");
  } finally {
    setAiLoading(false);
  }

    try {
      setAiLoading(true);
      const reply = await adminGenerateFullPost(topic, notes);

      // Intentar parsear JSON
      let obj;
      try {
        obj = JSON.parse(reply);
      } catch {
        // fallback: extraer primer bloque {...}
        const m = String(reply).match(/\{[\s\S]*\}/);
        if (!m) throw new Error("La IA no devolvió JSON válido. Prueba otra vez.");
        obj = JSON.parse(m[0]);
      }

      if (obj.title) set("title", obj.title);
      if (obj.slug) set("slug", slugify(obj.slug));
      if (obj.excerpt) set("excerpt", obj.excerpt);
      if (obj.category) set("category", obj.category);
      if (obj.content) set("content", obj.content);

      // si no devolvió slug, lo derivamos del título
      if (!obj.slug && obj.title) set("slug", slugify(obj.title));
    } catch (e) {
      alert(e?.message || "Error generando post");
    } finally {
      setAiLoading(false);
    }
  }

  function saveNow() {
    if (!form.title.trim()) return alert("Falta el título.");
    if (!form.slug.trim()) return alert("Falta el slug.");
    if (!form.category.trim()) return alert("Falta la categoría.");
    if (!form.excerpt.trim()) return alert("Falta el extracto (puedes generarlo con IA).");
    if (!form.content.trim()) return alert("Falta el contenido.");
    onSave(form);
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "grid", gap: 10 }}>
        {/* ✅ Generador IA */}
        <div className="card" style={{ padding: 12, border: "1px dashed rgba(0,0,0,.15)" }}>
          <div className="muted" style={{ marginBottom: 8 }}>
            Generador IA (borrador)
          </div>

          <label className="muted">Tema</label>
          <input
            className="input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ej: Cómo empezar a ahorrar siendo estudiante en RD"
          />

          <label className="muted" style={{ marginTop: 8 }}>
            Notas (opcional)
          </label>
          <textarea
            className="input"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: incluye ejemplo con 30,000 RD$/mes, 10% ahorro, deudas..."
          />

          <button
            className="btn"
            type="button"
            disabled={aiLoading}
            onClick={generateFullPost}
            style={{ marginTop: 10 }}
          >
            {aiLoading ? "Generando..." : "✨ Generar post completo con IA"}
          </button>
        </div>

        <label className="muted">Título</label>
        <input
          className="input"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Ej: Cómo hacer un presupuesto en RD"
        />

        <label className="muted">Slug (sin espacios, con guiones)</label>
        <input
          className="input"
          value={form.slug}
          onChange={(e) => set("slug", slugify(e.target.value))}
          placeholder="ej: como-hacer-un-presupuesto-en-rd"
        />

        <label className="muted">Categoría</label>
        <input
          className="input"
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          placeholder="Ej: Presupuesto, Deudas, Ahorro..."
        />

        <label className="muted">Extracto</label>
        <textarea
          className="input"
          rows={3}
          value={form.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
          placeholder="2 frases máximo..."
        />

        <button className="btn" type="button" onClick={generateExcerpt} disabled={aiLoading}>
          {aiLoading ? "Generando..." : "✨ Generar extracto con IA"}
        </button>

        <label className="muted">Contenido</label>
        <textarea
          className="input"
          rows={10}
          value={form.content}
          onChange={(e) => set("content", e.target.value)}
          placeholder={"Puedes usar Markdown:\n# Título\n- lista\n\nTexto..."}
        />

        <label className="muted">Imagen (URL)</label>
        <input
          className="input"
          value={form.coverImage}
          onChange={(e) => set("coverImage", e.target.value)}
          placeholder="https://..."
        />

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 6 }}>
          <label className="muted" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={!!form.published}
              onChange={(e) => set("published", e.target.checked)}
            />
            Publicado
          </label>

          <button className="btn btn-primary" disabled={saving} onClick={saveNow} type="button">
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
