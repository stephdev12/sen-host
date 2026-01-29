const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { referralCode: null }
  });

  console.log(`Updating ${users.length} users...`);

  for (const user of users) {
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await prisma.user.update({
      where: { id: user.id },
      data: { referralCode }
    });
  }

  console.log('Done.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
