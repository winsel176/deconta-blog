require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("📚 Creando cursos...");

  await prisma.course.createMany({
    data: [
      {
        slug: "presupuesto-desde-cero-rd",
        title: "Presupuesto desde Cero (RD)",
        shortDesc: "Aprende a organizar tu dinero en 7 días con un método simple.",
        longDesc:
          "Curso práctico para aprender a controlar tu dinero paso a paso. Incluye ejemplos en pesos dominicanos y plantilla descargable.",
        category: "Finanzas personales",
        level: "Principiante",
        image:
          "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=60",
        affiliateUrl: "https://TU_LINK_AQUI",
        active: true,
      },
      {
        slug: "ahorro-inteligente",
        title: "Ahorro Inteligente sin sacrificar tu vida",
        shortDesc: "Aprende a ahorrar sin sentir que estás sufriendo.",
        longDesc:
          "Descubre cómo ahorrar cada mes sin dejar de disfrutar. Estrategias reales aplicables en República Dominicana.",
        category: "Ahorro",
        level: "Principiante",
        image:
          "https://images.unsplash.com/photo-1604594849809-dfedbc827105?auto=format&fit=crop&w=1600&q=60",
        affiliateUrl: "https://TU_LINK_AQUI",
        active: true,
      },
    ],
  });

  console.log("✅ Cursos creados correctamente");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
