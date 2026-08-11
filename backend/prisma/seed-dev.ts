import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Tạo chuỗi ngày YYYY-MM-DD từ start đến end (exclusive end)
function dateRange(startStr: string, endStr: string): string[] {
  const dates: string[] = [];
  const [sy, sm, sd] = startStr.split('-').map(Number);
  const [ey, em, ed] = endStr.split('-').map(Number);
  const start = new Date(Date.UTC(sy, sm - 1, sd));
  const end = new Date(Date.UTC(ey, em - 1, ed));

  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

async function main() {
  // ── Seed cakes ──
  const dauXanh = await prisma.cake.upsert({
    where: { kind: 'Dau Xanh' },
    update: {},
    create: {
      kind: 'Dau Xanh',
      description: 'Bánh đậu xanh thơm béo',
      basePrice: 70000,
    },
  });

  const sauRieng = await prisma.cake.upsert({
    where: { kind: 'Sau Rieng' },
    update: {},
    create: {
      kind: 'Sau Rieng',
      description: 'Bánh sầu riêng đậm vị',
      basePrice: 85000,
    },
  });

  // ── Seed admin: loan / 123 ──
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

  // ── Seed slots: 12/08/2026 → 15/09/2026, mỗi cake 30 bánh/ngày ──
  const cakes = [dauXanh, sauRieng];
  const dates = dateRange('2026-08-12', '2026-09-15');

  let created = 0;
  for (const cake of cakes) {
    for (const date of dates) {
      const dateValue = new Date(`${date}T00:00:00.000Z`);
      const existing = await prisma.availability.findUnique({
        where: { cakeId_date: { cakeId: cake.id, date: dateValue } },
      });
      if (existing) continue;

      await prisma.availability.create({
        data: {
          cakeId: cake.id,
          date: dateValue,
          maxCapacity: 30,
          bufferLimit: 32,
          currentBooked: 0,
        },
      });
      created++;
    }
  }

  console.log(`Seed done ✓ — admin loan/123, ${created} slots created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
