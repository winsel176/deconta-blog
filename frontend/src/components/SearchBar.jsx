import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function SearchBar({ posts = [], placeholder = "Buscar en Deconta..." }) {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return posts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          (p.excerpt || "").toLowerCase().includes(query)
      )
      .slice(0, 5);
  }, [q, posts]);

  return (
    <div style={{ position: "relative", maxWidth: 520 }}>
      <input
        className="input"
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {results.length > 0 && (
        <div className="card" style={{ position: "absolute", top: 48, left: 0, right: 0, padding: 10, zIndex: 20 }}>
          <div style={{ display: "grid", gap: 8 }}>
            {results.map((p) => (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                style={{ padding: "10px 10px", borderRadius: 12 }}
                onClick={() => setQ("")}
              >
                <div style={{ fontWeight: 900, color: "#0b1b4a" }}>{p.title}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                  {p.category} • {p.date}
                </div>
              </Link>
            ))}
          </div>

          <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn" to={q.trim() ? `/blog` : "/blog"} onClick={() => setQ("")}>
              Ver blog
            </Link>
            <button className="btn" type="button" onClick={() => setQ("")}>
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
