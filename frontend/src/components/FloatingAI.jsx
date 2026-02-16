import { useState } from "react";
import { Link } from "react-router-dom";

export default function FloatingAI() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón flotante: solo cuando el chat está cerrado */}
      {!open && (
        <button
          className="ai-fab"
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir asistente"
          title="Abrir asistente"
        >
          IA
        </button>
      )}

      {/* Ventana del chat */}
      {open && (
        <div className="ai-modal-backdrop" onClick={() => setOpen(false)}>
          <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-modal-head">
              <div>
                <div style={{ fontWeight: 900 }}>Asistente Deconta</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  Ayuda con la página (guía paso a paso)
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" type="button" onClick={() => setOpen(false)}>
                  Cerrar
                </button>
                {/* Si quieres ir a la página /ai */}
                <Link className="btn btn-primary" to="/ai" onClick={() => setOpen(false)}>
                  Abrir IA
                </Link>
              </div>
            </div>

            <div className="ai-modal-body">
              <div className="card" style={{ padding: 12 }}>
                Hola 👋 Soy el asistente de Deconta.
                <br />
                <br />
                Puedo ayudarte con:
                <ul style={{ marginTop: 8 }}>
                  <li>Cómo usar la página</li>
                  <li>Publicar posts y subir imágenes</li>
                  <li>Cursos, categorías y navegación</li>
                </ul>
                ¿En qué te ayudo?
              </div>
            </div>

            <div className="ai-modal-foot">
              <input className="input" placeholder="Escribe aquí..." />
              <button className="btn btn-primary" type="button">
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
