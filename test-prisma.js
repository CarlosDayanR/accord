const { PrismaClient } = require("@prisma/client");

try {
  const p = new PrismaClient({});
  console.log("Prisma initialized successfully! Models:");
  console.log(Object.keys(p));
} catch (e) {
  console.error("Failed to initialize Prisma:");
  console.error(e);
}
