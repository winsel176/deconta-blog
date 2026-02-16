import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminDeletePost, adminListPosts, clearToken } from "../lib/adminApi.js";

export default function AdminPosts() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await adminListPosts();
      setItems(data);
    } catch (e) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onDelete(id) {
    if (!confirm("¿Borrar este post?")) return;
    try {
      await adminDeletePost(id);
      load();
    } catch (e) {
      alert(e.message || "Error borrando");
    }
  }

  function logout() {
    clearToken();
    nav("/admin");
  }

  return (
    <div className="container">
      <div className="section-head">
        <div>
          <h1 className="h1">Admin • Posts</h1>
          <p className="muted">Crear, editar, publicar o borrar.</p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn btn-primary" to="/admin/new">+ Nuevo post</Link>
          <button className="btn" onClick={logout}>Salir</button>
        </div>
      </div>

      {loading && <p className="muted">Cargando...</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {items.map((p) => (
          <div key={p.id} className="card" style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div className="muted" style={{ fontSize: 12 }}>
                  #{p.id} • {p.category} • {p.published ? "Publicado" : "Borrador"}
                </div>
                <div style={{ fontWeight: 900, marginTop: 4 }}>{p.title}</div>
                <div className="muted" style={{ marginTop: 6 }}>{p.slug}</div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <Link className="btn" to={`/blog/${p.slug}`} target="_blank">Ver</Link>
                <Link className="btn" to={`/admin/edit/${p.id}`}>Editar</Link>
                <button className="btn" onClick={() => onDelete(p.id)}>Borrar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
