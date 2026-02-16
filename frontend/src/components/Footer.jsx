import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: 40,
        borderTop: "1px solid rgba(0,0,0,.08)",
        background: "#f8fafc",
      }}
    >
      <div
        className="container"
        style={{
          padding: "24px 0",
          display: "grid",
          gap: 16,
        }}
      >
        {/* ===== INFO PRINCIPAL ===== */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div className="muted" style={{ fontWeight: 700 }}>
            © {new Date().getFullYear()} Deconta
          </div>

          <div className="muted">
            Educación financiera en lenguaje humano.
          </div>
        </div>

        {/* ===== LINKS LEGALES (LO QUE ADSENSE REVISA) ===== */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            fontSize: 14,
          }}
        >
          <Link className="muted" to="/terminos">
            Términos y Condiciones
          </Link>

          <Link className="muted" to="/privacidad">
            Política de Privacidad
          </Link>

          <Link className="muted" to="/cookies">
            Política de Cookies
          </Link>

          <Link className="muted" to="/contacto">
            Contacto
          </Link>
        </div>

        {/* ===== CREDENCIALES ===== */}
        <div className="muted" style={{ fontSize: 13 }}>
          App diseñada y desarrollada por{" "}
          <strong>Winsel Encarnación</strong> y <strong>Ashley Ortiz</strong> <br />
           </div>
      </div>
    </footer>
  );
}
