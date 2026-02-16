import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import NewsletterBox from "./NewsletterBox.jsx";

export default function Sidebar({ categories = [], topPosts = [] }) {
  const [catQuery, setCatQuery] = useState("");
  const [showAllCats, setShowAllCats] = useState(false);

  const normalizedCats = useMemo(() => {
    return (categories || [])
      .map((c) => String(c || "").trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "es"));
  }, [categories]);

  const filteredCats = useMemo(() => {
    const q = catQuery.trim().toLowerCase();
    if (!q) return normalizedCats;
    return normalizedCats.filter((c) => c.toLowerCase().includes(q));
  }, [normalizedCats, catQuery]);

  const visibleCats = filteredCats.slice(0, 7);
  const hasMore = filteredCats.length > 7;

  return (
    <div className="sidebar">
      {/* ===== LO MÁS LEÍDO ===== */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
          <h3 className="h2" style={{ margin: 0 }}>Lo más leído</h3>
          <Link className="muted" to="/blog" style={{ fontWeight: 800 }}>
            Ver todo
          </Link>
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {topPosts.map((p) => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="side-link">
              {p.title}
            </Link>
          ))}

          {topPosts.length === 0 && (
            <div className="muted" style={{ marginTop: 6 }}>
              Aún no hay artículos destacados.
            </div>
          )}
        </div>
      </div>

      {/* ===== CATEGORÍAS PREMIUM ===== */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <h3 className="h2" style={{ margin: 0 }}>Categorías</h3>
          <span className="muted" style={{ fontWeight: 800 }}>{normalizedCats.length}</span>
        </div>

        {/* Mini buscador */}
        <div style={{ marginTop: 12 }}>
          <input
            className="input input-compact"
            placeholder="Buscar categoría…"
            value={catQuery}
            onChange={(e) => setCatQuery(e.target.value)}
          />
        </div>

        {/* Chips (máx 7) */}
        <div className="chips" style={{ marginTop: 12 }}>
          <Link to="/blog" className="chip chip-soft">
            Todos
          </Link>

          {visibleCats.map((c) => (
            <Link key={c} to={`/blog?cat=${encodeURIComponent(c)}`} className="chip">
              {c}
            </Link>
          ))}
        </div>

        {/* Ver más */}
        {(hasMore || (catQuery.trim() && filteredCats.length > 0)) && (
          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <span className="muted" style={{ fontSize: 13 }}>
              {catQuery.trim()
                ? `Resultados: ${filteredCats.length}`
                : `Mostrando 7 de ${filteredCats.length}`}
            </span>

            <button className="btn" type="button" onClick={() => setShowAllCats(true)}>
              Ver más
            </button>
          </div>
        )}

        {catQuery.trim() && filteredCats.length === 0 && (
          <p className="muted" style={{ marginTop: 12 }}>
            No hay categorías que coincidan.
          </p>
        )}
      </div>

      {/* ✅ ===== BOLETÍN (AQUÍ ES DONDE FALTABA) ===== */}
      <NewsletterBox />

      {/* ===== MODAL: TODAS LAS CATEGORÍAS ===== */}
      {showAllCats && (
        <div className="modal-backdrop" onClick={() => setShowAllCats(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "82vh", overflow: "auto" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
              <h2 style={{ margin: 0 }}>Todas las categorías</h2>
              <button className="btn" onClick={() => setShowAllCats(false)}>Cerrar</button>
            </div>

            <p className="muted" style={{ marginTop: 6 }}>
              Tip: escribe para filtrar rápido.
            </p>

            <div style={{ marginTop: 12 }}>
              <input
                className="input"
                placeholder="Buscar categoría…"
                value={catQuery}
                onChange={(e) => setCatQuery(e.target.value)}
              />
            </div>

            <div className="chips" style={{ marginTop: 14 }}>
              <Link to="/blog" className="chip chip-soft" onClick={() => setShowAllCats(false)}>
                Todos
              </Link>

              {filteredCats.map((c) => (
                <Link
                  key={c}
                  to={`/blog?cat=${encodeURIComponent(c)}`}
                  className="chip"
                  onClick={() => setShowAllCats(false)}
                >
                  {c}
                </Link>
              ))}
            </div>

            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={() => setShowAllCats(false)}>
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
