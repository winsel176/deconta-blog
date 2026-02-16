require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const prisma = new PrismaClient();
const app = express();

// ===== Config =====
const PORT = Number(process.env.PORT) || 3001;

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=60";
const DEFAULT_COURSE_IMAGE =
  "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=60";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ===== Servir archivos subidos =====
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== Multer config =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

/** =========================
 * Helpers Auth
 * ========================= */
function signToken(user) {
  if (!process.env.JWT_SECRET) throw new Error("Falta JWT_SECRET en backend/.env");
  return jwt.sign(
    { sub: user.id, email: user.email, handle: user.handle, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return res.status(401).json({ error: "No autorizado" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

function requireAdmin(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (!process.env.ADMIN_TOKEN) {
    return res.status(500).json({ error: "ADMIN_TOKEN no está configurado en backend/.env" });
  }
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "No autorizado" });
  }
  next();
}

/** =========================
 * Health
 * ========================= */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, name: "Deconta Backend", time: new Date().toISOString() });
});


/** =========================
 * Posts públicos (solo publicados)
 * ========================= */
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al obtener posts" });
  }
});

app.get("/api/posts/:slug", async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { slug: req.params.slug } });
    if (!post || !post.published) return res.status(404).json({ error: "Post no encontrado" });
    res.json(post);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al obtener el post" });
  }
});

/** =========================
 * Admin CRUD Posts (ADMIN_TOKEN)
 * ========================= */
app.get("/api/admin/posts", requireAdmin, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
    res.json(posts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al listar posts (admin)" });
  }
});

app.post("/api/admin/posts", requireAdmin, async (req, res) => {
  try {
    const {
      slug,
      title,
      excerpt,
      content,
      category,
      authorName,
      authorHandle,
      coverImage,
      published = true,
    } = req.body || {};

    if (!slug || !title || !excerpt || !content || !category) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const created = await prisma.post.create({
      data: {
        slug,
        title,
        excerpt,
        content,
        category,
        authorName: authorName || "Deconta",
        authorHandle: authorHandle || "deconta",
        coverImage: coverImage?.trim() ? coverImage.trim() : DEFAULT_COVER,
        published: Boolean(published),
      },
    });

    res.json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error creando post" });
  }
});

app.put("/api/admin/posts/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await prisma.post.update({ where: { id }, data: req.body });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error actualizando post" });
  }
});

app.delete("/api/admin/posts/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.post.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error borrando post" });
  }
});

/** =========================
 * Upload imagen (PC -> backend)
 * ========================= */
app.post("/api/uploads/image", requireAuth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No llegó ninguna imagen" });
    const url = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    return res.json({ url });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error subiendo imagen" });
  }
});

/** =========================
 * Crear post (publicar)
 * ========================= */
app.post("/api/user/posts", requireAuth, async (req, res) => {
  try {
    const slug = String(req.body?.slug || "").trim();
    const title = String(req.body?.title || "").trim();
    const excerpt = String(req.body?.excerpt || "").trim();
    const content = String(req.body?.content || "").trim();
    const category = String(req.body?.category || "General").trim();
    const coverImage = String(req.body?.coverImage || "").trim();

    if (!slug || !title || !excerpt || !content) {
      return res.status(400).json({ error: "Faltan campos" });
    }

    const userId = Number(req.user.sub);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: "No autorizado" });

    const created = await prisma.post.create({
      data: {
        slug,
        title,
        excerpt,
        content,
        category,
        coverImage: coverImage?.trim() ? coverImage.trim() : DEFAULT_COVER,
        published: true,
        authorName: user.name,
        authorHandle: user.handle,
      },
    });

    res.json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error creando post" });
  }
});

/** =========================
 * Guardar borrador (published=false)
 * ========================= */
app.post("/api/user/drafts", requireAuth, async (req, res) => {
  try {
    const slug = String(req.body?.slug || "").trim();
    const title = String(req.body?.title || "").trim();
    const excerpt = String(req.body?.excerpt || "").trim();
    const content = String(req.body?.content || "").trim();
    const category = String(req.body?.category || "General").trim();
    const coverImage = String(req.body?.coverImage || "").trim();

    if (!slug || !title) return res.status(400).json({ error: "Faltan título o slug" });

    const userId = Number(req.user.sub);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: "No autorizado" });

    const draft = await prisma.post.upsert({
      where: { slug },
      update: {
        title,
        excerpt,
        content,
        category,
        coverImage: coverImage?.trim() ? coverImage.trim() : DEFAULT_COVER,
        published: false,
        authorName: user.name,
        authorHandle: user.handle,
      },
      create: {
        slug,
        title,
        excerpt,
        content,
        category,
        coverImage: coverImage?.trim() ? coverImage.trim() : DEFAULT_COVER,
        published: false,
        authorName: user.name,
        authorHandle: user.handle,
      },
    });

    res.json(draft);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error guardando borrador" });
  }
});

/** =========================
 * Borrar post (SOLO DUEÑO por email)
 * ========================= */
app.delete("/api/user/posts/:slug", requireAuth, async (req, res) => {
  try {
    const slug = String(req.params.slug || "").trim();
    if (!slug) return res.status(400).json({ error: "Slug inválido" });

    const owner = String(process.env.OWNER_EMAIL || "").trim().toLowerCase();
    const who = String(req.user?.email || "").trim().toLowerCase();

    if (!owner) {
      return res.status(500).json({ error: "Falta OWNER_EMAIL en backend/.env" });
    }

    if (who !== owner) {
      return res.status(403).json({
        error: "Solo el dueño puede borrar posts",
        who,
        owner,
      });
    }

    const exists = await prisma.post.findUnique({ where: { slug } });
    if (!exists) return res.status(404).json({ error: "Post no encontrado" });

    await prisma.post.delete({ where: { slug } });
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error borrando post" });
  }
});

/** =========================
 * IA (si la sigues usando, aquí está)
 * ========================= */
app.post("/api/ai", async (req, res) => {
  try {
    const message = (req.body?.message || "").trim();
    const history = Array.isArray(req.body?.history) ? req.body.history : [];
    if (!message) return res.status(400).json({ error: "Falta message" });

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        reply:
          "⚠️ IA en modo demo (falta OPENAI_API_KEY).",
      });
    }

    const client = new OpenAI({ apiKey });

    const system = `
Eres Deconta, un asistente educativo.
Responde claro y por pasos.
`.trim();

    const messages = [
      { role: "system", content: system },
      ...history.slice(-10),
      { role: "user", content: message },
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.4,
    });

    const reply = completion.choices?.[0]?.message?.content || "No pude generar respuesta.";
    return res.json({ reply });
  } catch (err) {
    const status = err?.status || err?.response?.status || 500;
    console.error("❌ Error en /api/ai:", status, err?.message);
    return res.status(status).json({ error: "Fallo al consultar la IA" });
  }
});

/** =========================
 * Auth
 * ========================= */
app.post("/api/auth/register", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const name = String(req.body?.name || "").trim();
    const handle = String(req.body?.handle || "").trim().toLowerCase();

    if (!email || !password || !name || !handle) return res.status(400).json({ error: "Faltan datos" });

    const existsEmail = await prisma.user.findUnique({ where: { email } });
    if (existsEmail) return res.status(400).json({ error: "Email ya existe" });

    const existsHandle = await prisma.user.findUnique({ where: { handle } });
    if (existsHandle) return res.status(400).json({ error: "Handle ya existe" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash, name, handle } });

    const token = signToken(user);
    res.json({ token, user: { id: user.id, email, name, handle } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error registrando" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: "Credenciales inválidas" });

    const token = signToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, handle: user.handle } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error login" });
  }
});

/** =========================
 * Perfil
 * ========================= */
app.get("/api/profile/me", requireAuth, async (req, res) => {
  try {
    const userId = Number(req.user.sub);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        handle: true,
        createdAt: true,
        avatarUrl: true,
        bio: true,
        instagram: true,
        x: true,
        linkedin: true,
        youtube: true,
        tiktok: true,
        website: true,
      },
    });

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error cargando perfil" });
  }
});

app.put("/api/profile/me", requireAuth, async (req, res) => {
  try {
    const userId = Number(req.user.sub);

    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ error: "El nombre es obligatorio" });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        avatarUrl: String(req.body?.avatarUrl || "").trim(),
        bio: String(req.body?.bio || "").trim(),
        instagram: String(req.body?.instagram || "").trim(),
        x: String(req.body?.x || "").trim(),
        linkedin: String(req.body?.linkedin || "").trim(),
        youtube: String(req.body?.youtube || "").trim(),
        tiktok: String(req.body?.tiktok || "").trim(),
        website: String(req.body?.website || "").trim(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        handle: true,
        createdAt: true,
        avatarUrl: true,
        bio: true,
        instagram: true,
        x: true,
        linkedin: true,
        youtube: true,
        tiktok: true,
        website: true,
      },
    });

    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error guardando perfil" });
  }
});

/** =========================
 * Newsletter (tu código)
 * ========================= */
function makeTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

function publicUrl(p) {
  const base = (process.env.APP_PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/+$/, "");
  return base + p;
}

function newToken() {
  return crypto.randomBytes(24).toString("hex");
}

async function sendConfirmEmail(to, token) {
  const confirmLink = publicUrl(`/api/newsletter/confirm?token=${encodeURIComponent(token)}`);
  const unsubscribeLink = publicUrl(`/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`);

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  const transport = makeTransport();

  await transport.sendMail({
    from: process.env.NEWSLETTER_FROM || process.env.SMTP_USER,
    to,
    subject: "✅ Confirma tu suscripción a Deconta",
    text: `Confirma tu suscripción:\n${confirmLink}\n\nDarte de baja:\n${unsubscribeLink}\n`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;max-width:560px">
        <h2 style="margin:0 0 10px 0;color:#0b1b4a">Confirma tu suscripción</h2>
        <p>Haz clic para confirmar y empezar a recibir artículos y tips.</p>
        <p>
          <a href="${confirmLink}"
             style="display:inline-block;background:#0b1b4a;color:#fff;text-decoration:none;padding:10px 14px;border-radius:10px">
            Confirmar suscripción
          </a>
        </p>
        <p style="color:#666;font-size:12px;margin-top:16px">Si no fuiste tú, ignora este correo.</p>
        <p style="color:#666;font-size:12px"><a href="${unsubscribeLink}">Darte de baja</a></p>
      </div>
    `,
  });
}

function simpleHtml(title, message) {
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="font-family:Arial,sans-serif;background:#f6f7fb;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;padding:18px;border-radius:14px;border:1px solid rgba(0,0,0,.08)">
    <h2 style="margin:0 0 10px 0;color:#0b1b4a">${title}</h2>
    <p style="margin:0;color:#333">${message}</p>
    <p style="margin-top:14px"><a href="http://localhost:5173" style="color:#0b1b4a">Volver a Deconta</a></p>
  </div>
</body>
</html>`;
}

app.post("/api/newsletter/subscribe", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email || !email.includes("@")) return res.status(400).json({ error: "Email inválido" });

    const token = newToken();
    const ua = String(req.headers["user-agent"] || "");
    const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "");

    const existing = await prisma.subscriber.findUnique({ where: { email } });

    const sub = existing
      ? await prisma.subscriber.update({
          where: { email },
          data: { token, unsubscribedAt: null, lastIP: ip, userAgent: ua },
        })
      : await prisma.subscriber.create({
          data: { email, token, lastIP: ip, userAgent: ua },
        });

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.json({ ok: true, message: "Suscrito ✅ (modo sin correo). Configura SMTP_*." });
    }

    await sendConfirmEmail(sub.email, sub.token);
    return res.json({ ok: true, message: "Listo ✅ Revisa tu correo para CONFIRMAR." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "No se pudo procesar la suscripción" });
  }
});

app.get("/api/newsletter/confirm", async (req, res) => {
  try {
    const token = String(req.query?.token || "").trim();
    if (!token) return res.status(400).send(simpleHtml("Token inválido", "Falta el token."));

    const sub = await prisma.subscriber.findUnique({ where: { token } });
    if (!sub) return res.status(404).send(simpleHtml("No encontrado", "Este link no es válido o expiró."));

    if (sub.unsubscribedAt) {
      await prisma.subscriber.update({
        where: { id: sub.id },
        data: { unsubscribedAt: null, confirmedAt: new Date() },
      });
      return res.status(200).send(simpleHtml("Suscripción reactivada ✅", "Tu suscripción fue reactivada."));
    }

    if (sub.confirmedAt) {
      return res.status(200).send(simpleHtml("Ya confirmado ✅", "Tu suscripción ya estaba confirmada."));
    }

    await prisma.subscriber.update({
      where: { id: sub.id },
      data: { confirmedAt: new Date() },
    });

    return res.status(200).send(simpleHtml("Confirmado ✅", "¡Listo! Ya estás suscrito a Deconta."));
  } catch (e) {
    console.error(e);
    return res.status(500).send(simpleHtml("Error", "No se pudo confirmar ahora mismo."));
  }
});

app.get("/api/newsletter/unsubscribe", async (req, res) => {
  try {
    const token = String(req.query?.token || "").trim();
    if (!token) return res.status(400).send(simpleHtml("Token inválido", "Falta el token."));

    const sub = await prisma.subscriber.findUnique({ where: { token } });
    if (!sub) return res.status(404).send(simpleHtml("No encontrado", "Este link no es válido o expiró."));

    if (sub.unsubscribedAt) {
      return res.status(200).send(simpleHtml("Ya dado de baja", "Tu suscripción ya estaba desactivada."));
    }

    await prisma.subscriber.update({
      where: { id: sub.id },
      data: { unsubscribedAt: new Date() },
    });

    return res.status(200).send(simpleHtml("Listo ✅", "Te diste de baja del boletín. Gracias por estar aquí."));
  } catch (e) {
    console.error(e);
    return res.status(500).send(simpleHtml("Error", "No se pudo dar de baja ahora mismo."));
  }
});

/** =========================
 * START
 * ========================= */
app.listen(PORT, () => {
  console.log(`✅ Deconta backend corriendo en http://localhost:${PORT}`);
});
