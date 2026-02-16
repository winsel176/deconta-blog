import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminPostForm from "../components/AdminPostForm.jsx";
import { adminListPosts, adminUpdatePost } from "../lib/adminApi.js";

export default function AdminEdit() {
  const { id } = useParams();
  const [initial, setInitial] = useState(null);
  const [saving, setSaving] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    adminListPosts()
      .then((all) => {
        const found = all.find((p) => String(p.id) === String(id));
        setInitial(found || null);
      })
      .catch((e) => alert(e.message || "Error cargando"));
  }, [id]);

  async function onSave(form) {
    setSaving(true);
    try {
      await adminUpdatePost(id, form);
      nav("/admin/posts");
    } catch (e) {
      alert(e.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  if (!initial) {
    return (
      <div className="container">
        <h1 className="h1">Cargando...</h1>
        <Link className="btn" to="/admin/posts">Volver</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-head">
        <div>
          <h1 className="h1">Editar post #{id}</h1>
          <p className="muted">Actualiza el contenido.</p>
        </div>
        <Link className="btn" to="/admin/posts">Volver</Link>
      </div>

      <AdminPostForm initial={initial} onSave={onSave} saving={saving} />
    </div>
  );
}
