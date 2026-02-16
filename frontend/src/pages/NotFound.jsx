import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container" style={{ padding: 40 }}>
      <h1 className="h1">Página no encontrada</h1>
      <p className="muted">El enlace no existe o cambió.</p>

      <div style={{ marginTop: 12 }}>
        <Link className="btn btn-primary" to="/">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
