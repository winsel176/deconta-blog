import { useState } from "react";
import { API_URL } from "../lib/config.js";

export default function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();

    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      setMsg("Introduce un correo válido.");
      return;
    }

    try {
      setLoading(true);
      setMsg("");

      const r = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean }),
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Error");

      setMsg(data.message || "Revisa tu correo para confirmar.");
      setEmail("");
    } catch (e) {
      setMsg(e?.message || "Error al suscribirse.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <h3 className="h2" style={{ marginTop: 0 }}>📬 Recibe artículos por correo</h3>

      <p className="muted" style={{ marginTop: 6 }}>
        Educación financiera clara. Sin spam. Puedes darte de baja cuando quieras.
      </p>

      <form onSubmit={submit} style={{ marginTop: 12 }}>
        <input
          className="input"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading}
          style={{ width: "100%", marginTop: 10 }}
        >
          {loading ? "Suscribiendo..." : "Suscribirme"}
        </button>
      </form>

      {msg && (
        <p className="muted" style={{ marginTop: 10 }}>
          {msg}
        </p>
      )}

      <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
        Al suscribirte aceptas recibir correos de Deconta. Consulta nuestros{" "}
        <a href="/terminos">Términos</a>.
      </p>
    </div>
  );
}
