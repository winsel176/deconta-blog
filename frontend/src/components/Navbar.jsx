import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

function isLoggedIn() {
  return !!localStorage.getItem("DECONTA_TOKEN");
}

function getUser() {
  try {
    const raw = localStorage.getItem("DECONTA_USER");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem("DECONTA_TOKEN");
  localStorage.removeItem("DECONTA_USER");
}

export default function Navbar() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const logged = isLoggedIn();
  const user = getUser();

  useEffect(() => {
    function onDoc(e) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="nav">
      <div className="container">
        <div className="nav-inner">
          {/* Brand */}
          <Link to="/" className="brand">
            <span className="brand-dot" />
            <span style={{ fontWeight: 950, letterSpacing: 0.2 }}>Deconta</span>
          </Link>

          {/* Links */}
          <nav className="nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-a ${isActive ? "active" : ""}`}>
              Inicio
            </NavLink>
            <NavLink to="/blog" className={({ isActive }) => `nav-a ${isActive ? "active" : ""}`}>
              Blog
            </NavLink>
          </nav>

          {/* Right */}
          <div className="nav-right">
            {!logged ? (
              <>
                <Link className="btn" to="/login">Iniciar sesión</Link>
                <Link className="btn btn-primary" to="/register">Crear cuenta</Link>
              </>
            ) : (
              <div ref={boxRef} style={{ position: "relative" }}>
                <button
                  className="btn"
                  onClick={() => setOpen((s) => !s)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
                >
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 999,
                      background: "rgba(31,60,255,.12)",
                      border: "1px solid rgba(31,60,255,.20)",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 900,
                      color: "#0b1b4a",
                    }}
                  >
                    {(user?.name || user?.handle || "U").slice(0, 1).toUpperCase()}
                  </span>
                  <div style={{ textAlign: "left", lineHeight: 1.1 }}>
                    <div style={{ fontWeight: 900 }}>{user?.name || "Mi cuenta"}</div>
                    <div className="muted" style={{ fontSize: 12 }}>@{user?.handle || "usuario"}</div>
                  </div>
                  <span className="muted" style={{ fontWeight: 900 }}>▾</span>
                </button>

                {open && (
                  <div
                    className="card"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 10px)",
                      width: 260,
                      padding: 10,
                      zIndex: 50,
                    }}
                  >
                    <Link className="btn" style={{ width: "100%", justifyContent: "center" }} to="/profile" onClick={() => setOpen(false)}>
                      Perfil
                    </Link>
                    <Link className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} to="/write" onClick={() => setOpen(false)}>
                      Crear post
                    </Link>

                    <div style={{ height: 1, background: "rgba(0,0,0,.06)", margin: "10px 0" }} />

                    <button
                      className="btn"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => {
                        logout();
                        setOpen(false);
                        nav("/");
                      }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
