import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.cake.upsert({
    where: { kind: 'Dau Xanh' },
    update: {},
    create: {
      kind: 'Dau Xanh',
      description: 'Banh rat ngon',
      basePrice: 70,
    },
  });

  await prisma.cake.upsert({
    where: { kind: 'Sau Rieng' },
    update: {},
    create: {
      kind: 'Sau Rieng',
      description: 'Banh rat ngon',
      basePrice: 70,
    },
  });
}

main()
  .then(() => {
    console.log('Seeding done');
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
