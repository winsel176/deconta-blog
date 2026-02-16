import { useEffect, useRef, useState } from "react";
import { getToken } from "../lib/auth.js";
import { API_URL } from "../lib/config.js";

export default function RichEditor({ value, onChange }) {
  const ref = useRef(null);
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  // Set initial html
  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerHTML !== (value || "")) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  function emit() {
    const html = ref.current?.innerHTML || "";
    onChange?.(html);
  }

  function cmd(command, arg = null) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  }

  async function uploadImage(file) {
    const token = getToken();
    if (!token) throw new Error("Tienes que iniciar sesión para subir imágenes.");

    const form = new FormData();
    form.append("image", file);

    const r = await fetch(`${API_URL}/api/uploads/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.error || "Error subiendo imagen");
    return data.url;
  }

  async function onPickImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación rápida
    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten imágenes.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen pesa más de 5MB. Usa una más ligera.");
      e.target.value = "";
      return;
    }

    try {
      setBusy(true);
      const url = await uploadImage(file);

      // Inserta imagen en el cursor
      ref.current?.focus();
      document.execCommand("insertImage", false, url);
      emit();
    } catch (err) {
      alert(err?.message || "Error con la imagen");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <div
        className="editorToolbar"
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <button className="btn" type="button" onClick={() => cmd("bold")}>
          <b>B</b>
        </button>
        <button className="btn" type="button" onClick={() => cmd("italic")}>
          <i>I</i>
        </button>
        <button className="btn" type="button" onClick={() => cmd("underline")}>
          <u>U</u>
        </button>

        <span style={{ width: 1, height: 24, background: "rgba(0,0,0,.08)" }} />

        <button className="btn" type="button" onClick={() => cmd("formatBlock", "H2")}>
          Título
        </button>
        <button className="btn" type="button" onClick={() => cmd("formatBlock", "H3")}>
          Subtítulo
        </button>
        <button className="btn" type="button" onClick={() => cmd("formatBlock", "P")}>
          Texto
        </button>

        <span style={{ width: 1, height: 24, background: "rgba(0,0,0,.08)" }} />

        <button className="btn" type="button" onClick={() => cmd("insertUnorderedList")}>
          • Lista
        </button>
        <button className="btn" type="button" onClick={() => cmd("insertOrderedList")}>
          1. Lista
        </button>

        <span style={{ width: 1, height: 24, background: "rgba(0,0,0,.08)" }} />

        <button
          className="btn btn-primary"
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? "Subiendo..." : "📷 Insertar imagen"}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={onPickImage}
        />
      </div>

      <div
        ref={ref}
        contentEditable
        onInput={emit}
        className="editorArea"
        style={{
          minHeight: 260,
          padding: 14,
          borderRadius: 14,
          border: "1px solid rgba(0,0,0,.10)",
          background: "rgba(255,255,255,.85)",
          outline: "none",
        }}
      />

      <p className="muted" style={{ marginTop: 10 }}>
        Tip: usa títulos, listas e imágenes para que el post se vea profesional.
      </p>
    </div>
  );
}
