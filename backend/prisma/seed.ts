import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const username = 'loan';
  const password = '19021970';
  const fullName = 'Loan';

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: {
      username,
    },
    update: {
      passwordHash,
      fullName,
    },
    create: {
      username,
      passwordHash,
      fullName,
    },
  });

  console.log(`Admin "${username}" created/updated successfully ✓`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });