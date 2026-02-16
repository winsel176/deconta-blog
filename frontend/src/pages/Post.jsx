import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { getPostBySlug } from "../lib/api.js";
import { API_URL } from "../lib/config.js";

export default function Post() {
  const { slug } = useParams();
  const nav = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===== Helpers seguros (no dependen de auth.js) =====
  function getTokenSafe() {
    return (
      localStorage.getItem("DECONTA_TOKEN") ||
      localStorage.getItem("DECONTA_TOKEN_V1") ||
      ""
    );
  }

  function getUserSafe() {
    const raw =
      localStorage.getItem("DECONTA_USER") ||
      localStorage.getItem("DECONTA_USER_V1") ||
      "";
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  const token = getTokenSafe();
  const me = getUserSafe();

  useEffect(() => {
    setLoading(true);

    getPostBySlug(slug)
      .then((p) => {
        if (!p) {
          setPost(null);
          return;
        }

        setPost({
          ...p,
          date: p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "",
          author: {
            name: p.authorName || "Deconta",
            handle: p.authorHandle || "deconta",
          },
          category: p.category || "General",
          title: p.title || "Sin título",
          content: p.content || "",
          coverImage: p.coverImage || "",
        });
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container">
        <h1 className="h1">Cargando…</h1>
        <p className="muted">Abriendo el artículo.</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container">
        <div className="card" style={{ padding: 16 }}>
          <h2 className="h2">Artículo no encontrado</h2>
          <p className="muted">El artículo no existe o fue eliminado.</p>
          <Link className="btn" to="/blog">
            Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  const cover = post.coverImage?.trim()
    ? post.coverImage
    : "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=60";

  const safeHtml = DOMPurify.sanitize(String(post.content || ""));

  const canDelete =
    !!token &&
    !!me?.handle &&
    String(me.handle).toLowerCase() === "admin";

  async function deletePost() {
    if (!confirm("¿Seguro que quieres borrar este post? Esto no se puede deshacer.")) return;

    try {
      const r = await fetch(
        `${API_URL}/api/user/posts/${encodeURIComponent(slug)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || "No se pudo borrar");

      alert("Post borrado ✅");
      nav("/blog");
    } catch (e) {
      alert(e?.message || "Error borrando");
    }
  }

  return (
    <div className="container" style={{ maxWidth: 860 }}>
      <article className="card" style={{ overflow: "hidden" }}>
        <img
          src={cover}
          alt={post.title}
          style={{
            width: "100%",
            maxHeight: 380,
            objectFit: "cover",
            display: "block",
          }}
        />

        <div style={{ padding: 20 }}>
          <div className="postcard-meta">
            <span className="pill">{post.category}</span>
            <span className="muted">{post.date}</span>
            <span className="muted">•</span>
            <span className="muted">
              Por <span className="author">{post.author?.name || "Deconta"}</span>
            </span>
          </div>

          <h1 className="h1" style={{ fontSize: 30, marginTop: 12 }}>
            {post.title}
          </h1>

          <div
            className="content"
            style={{ marginTop: 18, lineHeight: 1.8, fontSize: 16 }}
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />

          <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn" to="/blog">
              ← Volver al blog
            </Link>

            {canDelete && (
              <button className="btn" onClick={deletePost}>
                🗑️ Borrar post
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
