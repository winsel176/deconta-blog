import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import Sidebar from "../components/Sidebar.jsx";
import { getPosts } from "../lib/api.js";

const DEFAULT_CATEGORIES = [
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

function normalize(p) {
  const createdAt = p?.createdAt ? new Date(p.createdAt) : null;
  return {
    ...p,
    date: createdAt ? createdAt.toISOString().slice(0, 10) : "",
    author: { name: p?.authorName || "Deconta", handle: p?.authorHandle || "deconta" },
    category: (p?.category || "General").trim() || "General",
    title: p?.title || "",
    excerpt: p?.excerpt || "",
    slug: p?.slug || "",
  };
}

export default function Blog() {
  const [params] = useSearchParams();
  const cat = params.get("cat");

  const [query, setQuery] = useState("");
  const [catQuery, setCatQuery] = useState("");
  const [showAllCats, setShowAllCats] = useState(false);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts()
      .then((data) => setPosts((Array.isArray(data) ? data : []).map(normalize)))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  // Orden estable por fecha (por si el backend cambia)
  const orderedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
  }, [posts]);

  // Catálogo fijo + detectadas en posts
  const categories = useMemo(() => {
    const detected = orderedPosts.map((p) => p.category).filter(Boolean);
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...detected])).sort((a, b) =>
      a.localeCompare(b, "es")
    );
  }, [orderedPosts]);

  const topPosts = useMemo(() => orderedPosts.slice(0, 5), [orderedPosts]);

  const list = useMemo(() => {
    let filtered = orderedPosts;

    if (cat) filtered = filtered.filter((p) => p.category === cat);

    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.excerpt || "").toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [orderedPosts, cat, query]);

  // mini buscador de categorías
  const filteredCats = useMemo(() => {
    const q = catQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.toLowerCase().includes(q));
  }, [categories, catQuery]);

  const catsToShow = useMemo(() => {
    if (showAllCats) return filteredCats;
    return filteredCats.slice(0, 7);
  }, [filteredCats, showAllCats]);

  if (loading) {
    return (
      <div className="container">
        <h1 className="h1">Cargando…</h1>
        <p className="muted">Trayendo artículos desde el backend.</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* ===== HEADER ESTABLE (no “brinca”) ===== */}
      <div className="blogHeader card" style={{ padding: 16 }}>
        <div className="blogHeaderRow">
          <div style={{ flex: 1, minWidth: 280 }}>
            <h1 className="h1" style={{ marginTop: 0 }}>Blog</h1>

            {/* Reserva espacio SIEMPRE para que no cambie el layout */}
            <div className="muted" style={{ minHeight: 22, fontWeight: 700 }}>
              {cat ? (
                <>
                  Filtrando por: <strong>{cat}</strong>
                </>
              ) : (
                <span>&nbsp;</span>
              )}
            </div>

            {/* Buscador con ancho fijo/estable */}
            <div style={{ marginTop: 12, width: "min(620px, 100%)" }}>
              <input
                className="input"
                placeholder="Buscar artículos… (título o extracto)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: "100%", minHeight: 44 }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {cat && (
              <Link className="btn" to="/blog">
                Quitar filtro
              </Link>
            )}
            <Link className="btn btn-primary" to="/cursos">
              Ver cursos
            </Link>
          </div>
        </div>
      </div>

      <div className="layout" style={{ marginTop: 14 }}>
        {/* ===== Columna izquierda ===== */}
        <div style={{ display: "grid", gap: 14 }}>
          {/* Categorías premium */}
          <div className="card" style={{ padding: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "baseline",
              }}
            >
              <h2 className="h2" style={{ margin: 0 }}>
                Categorías
              </h2>

              <button className="btn" type="button" onClick={() => setShowAllCats((s) => !s)}>
                {showAllCats ? "Ver menos" : "Ver más"}
              </button>
            </div>

            <div style={{ marginTop: 10 }}>
              <input
                className="input input-compact"
                placeholder="Buscar categoría…"
                value={catQuery}
                onChange={(e) => setCatQuery(e.target.value)}
              />
            </div>

            <div className="chips" style={{ marginTop: 12 }}>
              <Link className="chip chip-soft" to="/blog">
                Todos
              </Link>

              {catsToShow.map((c) => (
                <Link key={c} className="chip" to={`/blog?cat=${encodeURIComponent(c)}`}>
                  {c}
                </Link>
              ))}
            </div>

            {!showAllCats && filteredCats.length > 7 && (
              <p className="muted" style={{ marginTop: 10, fontSize: 13 }}>
                Mostrando 7 de {filteredCats.length}. Usa “Ver más” o el buscador.
              </p>
            )}

            {showAllCats && catQuery.trim() && filteredCats.length === 0 && (
              <p className="muted" style={{ marginTop: 10 }}>
                No hay categorías que coincidan.
              </p>
            )}
          </div>

          {/* Lista de posts */}
          <div className="blogPosts">
            {list.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>

          {list.length === 0 && (
            <div className="card" style={{ padding: 16 }}>
              <h2 className="h2">No hay resultados</h2>
              <p className="muted">Prueba otra búsqueda o quita el filtro.</p>
              <Link className="btn" to="/blog">
                Volver
              </Link>
            </div>
          )}
        </div>

        {/* ===== Columna derecha ===== */}
        <Sidebar categories={categories} topPosts={topPosts} />
      </div>
    </div>
  );
}
