const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function createUsers() {
  try {
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash("test123", 12);
    console.log("✅ Password hashed successfully");
    
    console.log("👤 Creating test user...");
    const testUser = await prisma.user.upsert({
      where: { email: "test@aranza.io" },
      update: {
        password: hashedPassword, // Update password in case it exists
      },
      create: {
        email: "test@aranza.io",
        name: "Usuario de Pruebas PRO",
        password: hashedPassword,
        subscription: "PRO",
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        role: "USER"
      }
    });
    console.log("✅ Test user created:", testUser.email);
    
    console.log("👨‍💼 Creating admin user...");
    const adminUser = await prisma.user.upsert({
      where: { email: "admin@aranza.io" },
      update: {
        password: hashedPassword, // Update password in case it exists
      },
      create: {
        email: "admin@aranza.io",
        name: "Administrator",
        password: hashedPassword,
        subscription: "PRO",
        subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        role: "ADMIN"
      }
    });
    console.log("✅ Admin user created:", adminUser.email);
    
    console.log("✅ All users created successfully!");
    
  } catch (error) {
    console.error("❌ Error creating users:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();