const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.log('Usage: node scripts/make-admin.js <email>');
    console.log('Example: node scripts/make-admin.js admin@example.com');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });

    console.log(`✅ User ${email} is now an ADMIN`);
    console.log(`📋 User ID: ${updatedUser.id}`);
    console.log(`🌐 Admin panel: http://localhost:3000/admin`);

  } catch (error) {
    console.error('❌ Error making user admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();