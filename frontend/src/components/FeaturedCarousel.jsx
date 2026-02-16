import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function FeaturedCarousel({ posts = [] }) {
  const featured = useMemo(() => posts.slice(0, 5), [posts]); // ✅ máximo 5
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (featured.length <= 1) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % featured.length); // ✅ infinito
    }, 3500);
    return () => clearInterval(t);
  }, [featured.length]);

  if (!featured.length) return null;

  const current = featured[idx];

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <Link to={`/blog/${current.slug}`} style={{ display: "block" }}>
        <div style={{ position: "relative" }}>
          <img
            src={current.coverImage || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=60"}
            alt={current.title}
            style={{ width: "100%", height: 340, objectFit: "cover", display: "block" }}
          />

          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              padding: 16,
              background: "linear-gradient(transparent, rgba(0,0,0,.72))",
              color: "white",
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ background: "rgba(255,255,255,.18)", padding: "6px 10px", borderRadius: 999 }}>
                {current.category || "General"}
              </span>
              <span style={{ opacity: 0.9 }}>{current.title}</span>
            </div>
            <div style={{ marginTop: 8, opacity: 0.9, maxWidth: 900 }}>
              {current.excerpt}
            </div>
          </div>
        </div>
      </Link>

      {/* indicadores + clicks directos */}
      <div style={{ display: "flex", gap: 8, padding: 12, flexWrap: "wrap" }}>
        {featured.map((p, i) => (
          <button
            key={p.slug}
            className="chip"
            onClick={() => setIdx(i)}
            type="button"
            style={{
              cursor: "pointer",
              border: i === idx ? "1px solid rgba(11,27,74,.55)" : "1px solid rgba(0,0,0,.08)"
            }}
            title={p.title}
          >
            {i + 1}
          </button>
        ))}
        <div className="muted" style={{ marginLeft: 8 }}>
          Destacados (5): puedes hacer click en cualquiera.
        </div>
      </div>
    </div>
  );
}
