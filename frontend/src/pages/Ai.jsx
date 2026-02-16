import { useState } from "react";
import { API_URL } from "../lib/config.js";

export default function Ai() {
  const API = `${API_URL}/api/ai`;

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hola, soy Deconta. Cuéntame tu situación (ingresos, deudas, meta) y te ayudo por pasos. *No es asesoría financiera profesional.*",
    },
  ]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const history = next.map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");

      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "Ahora mismo no puedo responder. Revisa:\n- Que el backend esté corriendo\n- Que la URL del backend esté bien configurada\n\nSi estás en local: backend en http://localhost:3001",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1 className="h1">IA – Asistente</h1>
      <p className="muted">Educativo. No reemplaza un profesional.</p>

      <div className="card chat" style={{ marginTop: 12 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`bubble ${m.role === "user" ? "user" : "assistant"}`}
          >
            {m.content}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        <textarea
          className="textarea"
          placeholder="Ej: Tengo 2 tarjetas, me atrasé 1 mes, ¿qué hago primero?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={send} disabled={loading}>
            {loading ? "Pensando..." : "Enviar"}
          </button>

          <button
            className="btn"
            onClick={() => setMessages(messages.slice(0, 1))}
            disabled={loading}
          >
            Limpiar chat
          </button>
        </div>
      </div>
    </div>
  );
}
