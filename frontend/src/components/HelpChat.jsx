import { useState } from "react";

const ANSWERS = {
  inicio: `Hola 👋  
Soy el asistente de ayuda de Deconta.

Puedo ayudarte con:
• Cómo usar la página  
• Blog y artículos  
• Cursos recomendados  
• Información general  

Selecciona una pregunta 👇`,
  quees: `Deconta es una plataforma educativa sobre finanzas personales.

Aquí encontrarás:
• Artículos claros y sencillos  
• Cursos recomendados  
• Contenido educativo  

No somos un banco ni una asesoría.`,
  asesoria: `No.  
Deconta NO ofrece asesoría financiera profesional.

Todo el contenido es educativo e informativo.`,
  blog: `En el Blog puedes:
• Leer artículos
• Filtrar por categorías
• Buscar temas específicos`,
  cursos: `Los cursos son recomendaciones educativas de terceros.

Algunos enlaces pueden ser afiliados, sin costo adicional para ti.`,
  dinero: `Deconta puede monetizar mediante:
• Cursos afiliados
• Publicidad (Google AdSense)`,
  contacto: `Puedes contactarnos en:

📧 winsel706@gmail.com  
📷 Instagram: @winsel0`,
};

export default function HelpChat() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(ANSWERS.inicio);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            fontSize: 18,
            cursor: "pointer",
            zIndex: 9999,
          }}
        >
          ?
        </button>
      )}

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 300,
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 20px 40px rgba(0,0,0,.2)",
            zIndex: 10000,
          }}
        >
          <div style={{ padding: 12, borderBottom: "1px solid #eee" }}>
            <strong>Asistente Deconta</strong>
            <button
              onClick={() => setOpen(false)}
              style={{ float: "right", border: "none", background: "none", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: 12, fontSize: 14, whiteSpace: "pre-line" }}>
            {text}
          </div>

          <div style={{ padding: 10, borderTop: "1px solid #eee" }}>
            <button className="btn" onClick={() => setText(ANSWERS.quees)}>¿Qué es Deconta?</button>
            <button className="btn" onClick={() => setText(ANSWERS.asesoria)}>¿Ofrecen asesoría?</button>
            <button className="btn" onClick={() => setText(ANSWERS.blog)}>¿Cómo uso el blog?</button>
            <button className="btn" onClick={() => setText(ANSWERS.cursos)}>¿Qué son los cursos?</button>
            <button className="btn" onClick={() => setText(ANSWERS.dinero)}>¿Cómo gana dinero?</button>
            <button className="btn" onClick={() => setText(ANSWERS.contacto)}>Contacto</button>
          </div>
        </div>
      )}
    </>
  );
}
