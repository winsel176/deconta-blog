import { useEffect } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "DECONTA_TERMS_ACCEPTED_V2";

export function hasAcceptedTerms() {
  return localStorage.getItem(STORAGE_KEY) === "1";
}

export function acceptTerms() {
  localStorage.setItem(STORAGE_KEY, "1");
}

export default function TermsModal({ open, onAccept }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,.55)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <div
        className="card"
        style={{
          width: "min(860px, 100%)",
          maxHeight: "85vh",
          overflow: "hidden",
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
        }}
      >
        <div style={{ padding: 16, borderBottom: "1px solid rgba(0,0,0,.08)" }}>
          <div className="muted">Deconta</div>
          <h2 className="h2" style={{ marginTop: 6, marginBottom: 0 }}>
            Antes de continuar
          </h2>
          <p className="muted" style={{ marginTop: 8 }}>
            Para usar Deconta debes aceptar los Términos. Resumen rápido:
          </p>
        </div>

        <div style={{ padding: 16, overflow: "auto", lineHeight: 1.7 }}>
          <ul className="muted" style={{ marginTop: 0 }}>
            <li>Deconta es un sitio <b>educativo e informativo</b>. No es asesoría profesional.</li>
            <li>Podemos mostrar <b>cursos recomendados</b> y algunos enlaces pueden ser <b>afiliados</b>.</li>
            <li>Podemos mostrar <b>publicidad</b>. Está prohibido generar clics/visitas falsas o engañosas.</li>
            <li>Si publicas contenido, eres responsable de lo que subas y de respetar derechos de terceros.</li>
            <li>Usamos cookies/tecnologías para funcionamiento, analítica y publicidad.</li>
          </ul>

          <div className="card" style={{ padding: 12, background: "rgba(0,0,0,.03)" }}>
            <div className="muted" style={{ marginBottom: 6 }}>
              Contacto:
            </div>
            <div><b>Correo:</b> winsel706@gmail.com</div>
            <div><b>Instagram:</b> @winsel0</div>
          </div>

          <p className="muted" style={{ marginTop: 12 }}>
            Puedes leer el documento completo aquí:{" "}
            <Link to="/terminos" className="author">Ver Términos y Condiciones completos</Link>
          </p>
        </div>

        <div
          style={{
            padding: 16,
            borderTop: "1px solid rgba(0,0,0,.08)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button className="btn btn-primary" onClick={onAccept}>
            Acepto y continuar
          </button>
        </div>
      </div>
    </div>
  );
}
