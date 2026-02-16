import { Link } from "react-router-dom";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=60";

export default function PostCard({ post }) {
  if (!post?.slug) return null;

  const cover = post.coverImage?.trim() ? post.coverImage.trim() : DEFAULT_COVER;

  return (
    <article
      className="card"
      style={{
        padding: 0,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,.06)",
      }}
    >
      <Link to={`/blog/${post.slug}`} style={{ display: "block" }}>
        <img
          src={cover}
          alt={post.title || "Post"}
          style={{
            width: "100%",
            height: 210,
            objectFit: "cover",
            display: "block",
          }}
          loading="lazy"
        />
      </Link>

      <div style={{ padding: 16 }}>
        {/* Meta */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          <span className="pill">{post.category || "General"}</span>
          {post.date && <span className="muted">{post.date}</span>}
          <span className="muted">•</span>
          <span className="muted">
            Por <span style={{ fontWeight: 800 }}>{post.author?.name || "Deconta"}</span>
          </span>
        </div>

        {/* Title */}
        <h2 style={{ margin: 0, fontSize: 20, lineHeight: 1.25 }}>
          <Link
            to={`/blog/${post.slug}`}
            style={{
              color: "inherit",
              textDecoration: "none",
              fontWeight: 900,
            }}
          >
            {post.title || "Sin título"}
          </Link>
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p
            className="muted"
            style={{
              marginTop: 10,
              marginBottom: 0,
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.excerpt}
          </p>
        )}

        {/* Actions */}
        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn btn-primary" to={`/blog/${post.slug}`}>
            Leer artículo
          </Link>
          <Link className="btn" to={`/blog?cat=${encodeURIComponent(post.category || "General")}`}>
            Ver más de {post.category || "General"}
          </Link>
        </div>
      </div>
    </article>
  );
}
