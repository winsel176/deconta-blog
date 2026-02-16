const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Ejecutando seed...");

  // Limpia para no duplicar
  await prisma.post.deleteMany();

  await prisma.post.createMany({
    data: [
      {
        slug: "como-hacer-un-presupuesto",
        title: "Cómo hacer un presupuesto personal",
        excerpt: "Guía práctica para organizar tus ingresos y gastos.",
        content:
          "# Cómo hacer un presupuesto\n\n" +
          "1) Anota tus ingresos.\n" +
          "2) Lista tus gastos fijos.\n" +
          "3) Separa ahorro primero.\n\n" +
          "⚠️ No es asesoría financiera profesional.",
        category: "Presupuesto",
        authorName: "Deconta",
        authorHandle: "deconta",
        coverImage:
          "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=60",
        published: true,
      },
      {
        slug: "errores-comunes-con-tarjetas",
        title: "Errores comunes con tarjetas de crédito",
        excerpt: "Evita estos errores que te hacen pagar más intereses.",
        content:
          "# Tarjetas de crédito\n\n" +
          "- Pagar solo el mínimo\n" +
          "- Usarlas sin presupuesto\n\n" +
          "⚠️ No es asesoría financiera profesional.",
        category: "Deudas",
        authorName: "Deconta",
        authorHandle: "deconta",
        coverImage:
          "https://images.unsplash.com/photo-1605902711622-cfb43c44367f?auto=format&fit=crop&w=1600&q=60",
        published: true,
      },
      {
        slug: "como-empezar-a-ahorrar",
        title: "Cómo empezar a ahorrar con poco dinero",
        excerpt: "No necesitas ganar mucho para empezar a ahorrar.",
        content:
          "# Ahorrar con poco\n\n" +
          "Empieza con 1% y sube poco a poco.\n\n" +
          "⚠️ No es asesoría financiera profesional.",
        category: "Ahorro",
        authorName: "Deconta",
        authorHandle: "deconta",
        coverImage:
          "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1600&q=60",
        published: true,
      },
    ],
  });
console.log("✅ Seed terminado.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
