import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, isLoggedIn, setAuth, getUser } from "../lib/auth.js";
import { API_URL } from "../lib/config.js";

export default function Profile() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      nav("/login");
      return;
    }

    fetch(`${API_URL}/api/profile/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.error || "Error cargando perfil");
        return data;
      })
      .then((data) => setMe(data))
      .catch((e) => setMe({ error: e.message }))
      .finally(() => setLoading(false));
  }, [nav]);

  function set(k, v) {
    setMe((s) => ({ ...s, [k]: v }));
  }

  function logout() {
    localStorage.removeItem("DECONTA_TOKEN");
    localStorage.removeItem("DECONTA_USER");

    setAuth("", null);
    nav("/login");
  }

  async function save() {
    try {
      setSaving(true);

      const r = await fetch(`${API_URL}/api/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(me),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || "Error");

      setMe(data);

      // Actualiza user guardado (navbar/autor)
      const old = getUser();
      if (old) setAuth(getToken(), { ...old, name: data.name, handle: data.handle });

      alert("Perfil guardado ✅");
    } catch (e) {
      alert(e?.message || "Error guardando");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <h1 className="h1">Cargando perfil...</h1>
      </div>
    );
  }

  if (!me || me.error) {
    return (
      <div className="container">
        <div className="card" style={{ padding: 16 }}>
          <h2 className="h2">No se pudo cargar tu perfil</h2>
          <p className="muted" style={{ marginTop: 8 }}>
            {me?.error || "Error desconocido"}
          </p>

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => window.location.reload()}>
              Reintentar
            </button>
            <button className="btn btn-primary" onClick={logout}>
              Volver a iniciar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 860 }}>
      <div className="section-head">
        <div>
          <h1 className="h1">Mi cuenta</h1>
          <p className="muted">
            @{me.handle} • {me.email}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>

          <button className="btn" onClick={logout} disabled={saving}>
            Salir
          </button>
        </div>
      </div>

      <div className="layout" style={{ marginTop: 14 }}>
        {/* Izquierda */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <img
              src={me.avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed=Deconta"}
              alt="avatar"
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                objectFit: "cover",
                border: "1px solid rgba(0,0,0,.08)",
              }}
            />
            <div style={{ flex: 1 }}>
              <div className="muted">Foto (URL)</div>
              <input
                className="input"
                value={me.avatarUrl || ""}
                onChange={(e) => set("avatarUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div className="muted">Nombre</div>
            <input className="input" value={me.name || ""} onChange={(e) => set("name", e.target.value)} />
          </div>

          <div style={{ marginTop: 12 }}>
            <div className="muted">Descripción</div>
            <textarea
              className="input"
              rows={4}
              value={me.bio || ""}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="Cuéntanos quién eres..."
            />
          </div>
        </div>

        {/* Derecha */}
        <div className="card" style={{ padding: 16 }}>
          <h2 className="h2">Redes</h2>

          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            <div>
              <div className="muted">Instagram</div>
              <input
                className="input"
                value={me.instagram || ""}
                onChange={(e) => set("instagram", e.target.value)}
                placeholder="@usuario o link"
              />
            </div>

            <div>
              <div className="muted">X (Twitter)</div>
              <input
                className="input"
                value={me.x || ""}
                onChange={(e) => set("x", e.target.value)}
                placeholder="@usuario o link"
              />
            </div>

            <div>
              <div className="muted">LinkedIn</div>
              <input
                className="input"
                value={me.linkedin || ""}
                onChange={(e) => set("linkedin", e.target.value)}
                placeholder="link"
              />
            </div>

            <div>
              <div className="muted">YouTube</div>
              <input
                className="input"
                value={me.youtube || ""}
                onChange={(e) => set("youtube", e.target.value)}
                placeholder="link"
              />
            </div>

            <div>
              <div className="muted">TikTok</div>
              <input
                className="input"
                value={me.tiktok || ""}
                onChange={(e) => set("tiktok", e.target.value)}
                placeholder="link"
              />
            </div>

            <div>
              <div className="muted">Sitio web</div>
              <input
                className="input"
                value={me.website || ""}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
