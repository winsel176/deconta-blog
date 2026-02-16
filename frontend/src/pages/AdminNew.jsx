import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminPostForm from "../components/AdminPostForm.jsx";
import { adminCreatePost } from "../lib/adminApi.js";

export default function AdminNew() {
  const [saving, setSaving] = useState(false);
  const nav = useNavigate();

  async function onSave(form) {
    setSaving(true);
    try {
      await adminCreatePost(form);
      nav("/admin/posts");
    } catch (e) {
      alert(e.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container">
      <div className="section-head">
        <div>
          <h1 className="h1">Nuevo post</h1>
          <p className="muted">Crear un artículo desde el panel.</p>
        </div>
        <Link className="btn" to="/admin/posts">Volver</Link>
      </div>

      <AdminPostForm onSave={onSave} saving={saving} />
    </div>
  );
}
