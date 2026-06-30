import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const soporte = await prisma.team.create({
    data: {
      name: "Soporte",
      quotas: {
        create: [
          { week: 1, maxSlots: 2 },
          { week: 2, maxSlots: 2 },
        ],
      },
    },
  });

  const desarrollo = await prisma.team.create({
    data: {
      name: "Desarrollo",
      quotas: {
        create: [
          { week: 1, maxSlots: 3 },
          { week: 2, maxSlots: 3 },
        ],
      },
    },
  });

  await prisma.user.createMany({
    data: [
      { email: "ana@empresa.com", name: "Ana", teamId: soporte.id },
      { email: "bruno@empresa.com", name: "Bruno", teamId: soporte.id },
      { email: "carla@empresa.com", name: "Carla", teamId: desarrollo.id },
      { email: "diego@empresa.com", name: "Diego", teamId: desarrollo.id },
    ],
  });

  console.log("Seed listo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
