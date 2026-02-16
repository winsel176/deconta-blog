import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "../lib/adminApi.js";

export default function AdminLogin() {
  const [token, setTok] = useState(localStorage.getItem("ADMIN_TOKEN") || "");
  const [error, setError] = useState("");
  const nav = useNavigate();

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!token.trim()) return setError("Pon el token.");
    setToken(token.trim());
    nav("/admin/posts");
  }

  return (
    <div className="container">
      <h1 className="h1">Admin</h1>
      <p className="muted">Entra con tu token (ADMIN_TOKEN).</p>

      <form className="card" style={{ padding: 16, maxWidth: 520 }} onSubmit={onSubmit}>
        <label className="muted">Token</label>
        <input
          className="input"
          value={token}
          onChange={(e) => setTok(e.target.value)}
          placeholder="deconta123"
          style={{ marginTop: 8 }}
        />
        {error && <p style={{ marginTop: 10, color: "crimson" }}>{error}</p>}

        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-primary" type="submit">Entrar</button>
          <button className="btn" type="button" onClick={() => { setTok(""); localStorage.removeItem("ADMIN_TOKEN"); }}>
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}
