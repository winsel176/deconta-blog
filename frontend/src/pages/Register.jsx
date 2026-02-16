import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { setAuth } from "../lib/auth.js";
import { API_URL } from "../lib/config.js";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    handle: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  function set(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function submit() {
    if (!form.name || !form.handle || !form.email || !form.password) {
      alert("Completa todos los campos.");
      return;
    }

    try {
      setLoading(true);

      const r = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          email: String(form.email || "").trim().toLowerCase(),
          handle: String(form.handle || "").trim().toLowerCase(),
          name: String(form.name || "").trim(),
        }),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || "Error");

      setAuth(data.token, data.user);
      nav("/write");
    } catch (e) {
      alert(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <h1 className="h1">Crear cuenta</h1>

      <div className="card" style={{ padding: 16, display: "grid", gap: 10 }}>
        <label className="muted">Nombre</label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Tu nombre"
        />

        <label className="muted">Usuario (handle)</label>
        <input
          className="input"
          value={form.handle}
          onChange={(e) => set("handle", e.target.value.toLowerCase())}
          placeholder="ej: winsel"
        />

        <label className="muted">Email</label>
        <input
          className="input"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="tu@email.com"
        />

        <label className="muted">Contraseña</label>
        <input
          className="input"
          type="password"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          placeholder="Mínimo 6-8 caracteres"
        />

        <button
          className="btn btn-primary"
          type="button"
          disabled={loading}
          onClick={submit}
        >
          {loading ? "Creando..." : "Crear cuenta"}
        </button>

        <div className="muted">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
