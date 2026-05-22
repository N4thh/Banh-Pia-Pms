import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Seed cakes
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

  // Hash password
  const passwordHash = await bcrypt.hash('Loan1902', 10);

  // Seed admin account
  await prisma.admin.upsert({
    where: {
      username: 'me',
    },
    update: {},
    create: {
      username: 'me',
      fullName: 'Me',
      passwordHash,
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