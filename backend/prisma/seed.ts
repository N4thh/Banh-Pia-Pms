import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ── Seed cakes ──
  await prisma.cake.upsert({
    where: { kind: 'Dau Xanh' },
    update: {},
    create: {
      kind: 'Dau Xanh',
      description: 'Bánh đậu xanh thơm béo',
      basePrice: 70000,
    },
  });

  await prisma.cake.upsert({
    where: { kind: 'Sau Rieng' },
    update: {},
    create: {
      kind: 'Sau Rieng',
      description: 'Bánh sầu riêng đậm vị',
      basePrice: 85000,
    },
  });

  // ── Seed admin account: loan / 123 ──
  const passwordHash = await bcrypt.hash('123', 10);

  await prisma.admin.upsert({
    where: { username: 'loan' },
    update: {},
    create: {
      username: 'loan',
      fullName: 'Loan',
      passwordHash,
    },
  });

  // ── Seed availability slots cho cake 1 & 2, vài ngày tới ──
  const cakes = await prisma.cake.findMany();

  const today = new Date();
  for (const cake of cakes) {
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      await prisma.availability.upsert({
        where: {
          cakeId_date: { cakeId: cake.id, date },
        },
        update: {},
        create: {
          cakeId: cake.id,
          date,
          maxCapacity: 50,
          bufferLimit: 52, // ~3% buffer
          currentBooked: 0,
        },
      });
    }
  }

  console.log('Seeding done ✓');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
