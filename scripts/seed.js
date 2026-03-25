const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.business_categories.count();
  if (count > 0) {
    console.log("Categories already exist. Skipping seed.");
    return;
  }

  console.log("Seeding business categories...");
  
  const categories = [
    {
      name: "Belleza y Bienestar",
      subs: ["Barbería", "Salón de Belleza", "Spa & Masajes", "Manicura"]
    },
    {
      name: "Salud",
      subs: ["Odontología", "Psicología", "Fisioterapia", "Nutrición"]
    },
    {
      name: "Servicios Profesionales",
      subs: ["Asesoría Legal", "Contabilidad", "Consultoría IT", "Clases Particulares"]
    }
  ];

  for (const cat of categories) {
    await prisma.business_categories.create({
      data: {
        name: cat.name,
        business_subcategories: {
          create: cat.subs.map(name => ({ name }))
        }
      }
    });
  }

  console.log("Seed successful!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
