import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getPosts } from "../lib/api.js";
import PostCard from "../components/PostCard";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar.jsx";
import FeaturedCarousel from "../components/FeaturedCarousel.jsx";

function isLoggedIn() {
  return !!localStorage.getItem("DECONTA_TOKEN");
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const logged = isLoggedIn();

  useEffect(() => {
    getPosts()
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  // Normaliza y ordena por fecha
  const normalized = useMemo(() => {
    const sorted = [...posts].sort((a, b) => {
      const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });

    return sorted
      .map((p) => {
        const createdAt = p?.createdAt ? new Date(p.createdAt) : null;
        return {
          ...p,
          date: createdAt ? createdAt.toISOString().slice(0, 10) : "",
          author: {
            name: p?.authorName || "Deconta",
            handle: p?.authorHandle || "deconta",
          },
          coverImage: p?.coverImage || "",
          category: (p?.category || "General").trim() || "General",
          excerpt: p?.excerpt || "",
          title: p?.title || "",
          slug: p?.slug || "",
        };
      })
      .filter((p) => p.slug && p.title);
  }, [posts]);

  // límites pedidos
  const featured = normalized.slice(0, 5); // carrusel: máx 5
  const latest = normalized.slice(0, 10); // home: máx 10

  const categories = useMemo(() => {
    return Array.from(new Set(normalized.map((p) => p.category))).filter(Boolean);
  }, [normalized]);

  const topCats = useMemo(() => categories.slice(0, 6), [categories]);

  if (loading) {
    return (
      <div className="container">
        <h1 className="h1">Cargando…</h1>
        <p className="muted">Preparando el portal.</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* ===== HERO ===== */}
      <section className="card home-hero" style={{ padding: 18 }}>
        <div className="home-hero-grid">
          <div>
            <div className="muted" style={{ fontWeight: 800 }}>
              Deconta • Educación financiera simple
            </div>

            <h1 className="h1" style={{ marginTop: 10 }}>
              Aprende de dinero. Mejora tu vida financiera.
            </h1>

            <p className="muted" style={{ marginTop: 8, maxWidth: 720 }}>
              Artículos prácticos hechos para República Dominicana y para gente que quiere mejorar su
              vida financiera sin complicarse.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              <Link className="btn btn-primary" to="/blog">
                Explorar el blog
              </Link>

              {logged ? (
                <Link className="btn" to="/write">
                  Crear post
                </Link>
              ) : (
                <Link className="btn" to="/register">
                  Crear cuenta
                </Link>
              )}
            </div>

            {/* categorías rápidas */}
            {topCats.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div className="muted" style={{ fontWeight: 800, marginBottom: 8 }}>
                  Temas populares
                </div>
                <div className="chips">
                  {topCats.map((c) => (
                    <Link key={c} className="chip" to={`/blog?cat=${encodeURIComponent(c)}`}>
                      {c}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panel derecho */}
          <div className="card" style={{ padding: 14, background: "rgba(255,255,255,0.85)" }}>
            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <div className="muted" style={{ fontWeight: 800 }}>
                  ¿Nuevo aquí?
                </div>
                <div style={{ fontWeight: 900, marginTop: 4 }}>
                  Empieza por un artículo destacado
                </div>
                <div className="muted" style={{ marginTop: 6 }}>
                  Abajo tienes una selección rotando (máx. 5). Entra a cualquiera mientras se mueve.
                </div>
              </div>

              <div className="card" style={{ padding: 12, boxShadow: "none" }}>
                <div className="muted" style={{ fontWeight: 800 }}>
                  Accesos rápidos
                </div>
                <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                  <Link className="btn" to="/blog" style={{ justifyContent: "center" }}>
                    Leer artículos
                  </Link>
                </div>
              </div>

              <div className="muted" style={{ fontSize: 13 }}>
                Consejo: guarda los posts que te sirvan y vuelve cuando tengas una duda.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BUSCADOR ===== */}
      <section style={{ marginTop: 14 }}>
        <div className="card" style={{ padding: 14 }}>
          <div className="muted" style={{ fontWeight: 800, marginBottom: 8 }}>
            Buscar en el blog
          </div>
          <SearchBar posts={normalized} />
        </div>
      </section>

      {/* ===== DESTACADOS ===== */}
      <section style={{ marginTop: 14 }}>
        <div className="section-head">
          <div>
            <h2 className="h2">Destacados</h2>
            <p className="muted" style={{ marginTop: 4 }}>
              Selección automática de los más recientes.
            </p>
          </div>
          <Link className="btn" to="/blog">
            Ver todo
          </Link>
        </div>

        <div style={{ marginTop: 10 }}>
          <FeaturedCarousel posts={featured} />
        </div>
      </section>

      {/* ===== ÚLTIMOS + SIDEBAR ===== */}
      <section className="layout" style={{ marginTop: 18 }}>
        {/* izquierda */}
        <div style={{ display: "grid", gap: 14 }}>
          <div className="section-head">
            <div>
              <h2 className="h2">Últimos artículos</h2>
              <p className="muted" style={{ marginTop: 4 }}>
                Lo más reciente para mejorar tus finanzas paso a paso.
              </p>
            </div>
            <Link className="btn" to="/blog">
              Ver todos
            </Link>
          </div>

          <div className="home-posts-grid">
            {latest.map((p) => (
              <div key={p.slug} className="home-postWrap">
                <PostCard post={p} />
              </div>
            ))}
          </div>

          {latest.length === 0 && (
            <div className="card" style={{ padding: 16 }}>
              <h2 className="h2">Aún no hay artículos</h2>
              <p className="muted">Crea el primero y empieza a construir tu portal.</p>

              {logged ? (
                <Link className="btn btn-primary" to="/write">
                  Crear post
                </Link>
              ) : (
                <Link className="btn btn-primary" to="/register">
                  Crear cuenta para publicar
                </Link>
              )}
            </div>
          )}
        </div>

        {/* derecha */}
        <Sidebar categories={categories} topPosts={latest.slice(0, 5)} />
      </section>
    </div>
  );
}
