import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { setAuth } from "../lib/auth.js";
import { API_URL } from "../lib/config.js";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  function set(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function submit() {
    if (!form.email || !form.password) {
      alert("Completa email y contraseña.");
      return;
    }

    try {
      setLoading(true);

      const r = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.email).trim().toLowerCase(),
          password: String(form.password),
        }),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || "Error iniciando sesión");

      setAuth(data.token, data.user);

      // ✅ Te mando a crear post (como lo tienes ahora)
      nav("/write");
    } catch (e) {
      alert(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <h1 className="h1">Iniciar sesión</h1>

      <div className="card" style={{ padding: 16, display: "grid", gap: 10 }}>
        <label className="muted">Email</label>
        <input
          className="input"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />

        <label className="muted">Contraseña</label>
        <input
          className="input"
          type="password"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
        />

        <button
          className="btn btn-primary"
          type="button"
          disabled={loading}
          onClick={submit}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <div className="muted">
          ¿No tienes cuenta? <Link to="/register">Crea una</Link>
        </div>
      </div>
    </div>
  );
}
