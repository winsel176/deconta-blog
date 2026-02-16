import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import { getPosts } from "../lib/api.js";

function normalize(p) {
  return {
    ...p,
    date: new Date(p.createdAt).toISOString().slice(0, 10),
    author: { name: p.authorName, handle: p.authorHandle },
  };
}

export default function Author() {
  const { handle } = useParams();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts()
      .then((data) => setPosts(data.map(normalize)))
      .finally(() => setLoading(false));
  }, []);

  const authorPosts = useMemo(() => {
    return posts.filter((p) => p.author?.handle === handle);
  }, [posts, handle]);

  const authorName = authorPosts[0]?.author?.name || handle;

  if (loading) {
    return (
      <div className="container">
        <h1 className="h1">Cargando...</h1>
        <p className="muted">Trayendo posts del autor.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ padding: 16 }}>
        <div className="muted">Autor</div>
        <h1 className="h1" style={{ marginBottom: 6 }}>
          {authorName}
        </h1>
        <p className="muted" style={{ marginTop: 0 }}>
          Educación financiera clara, práctica y con ejemplos.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <Link className="btn" to="/blog">Volver al blog</Link>
          <Link className="btn btn-primary" to="/ai">Preguntar a la IA</Link>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
        {authorPosts.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}

        {authorPosts.length === 0 && (
          <div className="card" style={{ padding: 16 }}>
            <h2 className="h2">Sin artículos todavía</h2>
            <p className="muted">
              Cuando activemos publicación, aquí saldrán todos los posts del autor.
            </p>
            <Link className="btn" to="/blog">Ver blog</Link>
          </div>
        )}
      </div>
    </div>
  );
}
