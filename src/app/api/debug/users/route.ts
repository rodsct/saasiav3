import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscription: true,
        password: true // We'll check if it exists
      }
    });

    const usersInfo = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscription: user.subscription,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
    }));

    return NextResponse.json({
      totalUsers: users.length,
      users: usersInfo,
      testUserExists: users.some(u => u.email === "test@aranza.io"),
      adminUserExists: users.some(u => u.email === "admin@aranza.io")
    });

  } catch (error) {
    console.error("Debug users error:", error);
    return NextResponse.json(
      { error: "Database error", details: error },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    console.log("🔧 Manual user creation started");
    
    // Delete existing test users first
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ["test@aranza.io", "admin@aranza.io"]
        }
      }
    });
    console.log("🗑️ Deleted existing test users");

    const hashedPassword = await bcrypt.hash("test123", 12);
    console.log("🔐 Password hashed, length:", hashedPassword.length);

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: "test@aranza.io",
        name: "Usuario de Pruebas PRO",
        password: hashedPassword,
        subscription: "PRO",
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        role: "USER"
      }
    });
    console.log("✅ Test user created:", testUser);

    // Create admin user  
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@aranza.io",
        name: "Administrator",
        password: hashedPassword,
        subscription: "PRO",
        subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        role: "ADMIN"
      }
    });
    console.log("✅ Admin user created:", adminUser);

    // Test password verification
    const passwordTest = await bcrypt.compare("test123", hashedPassword);
    console.log("🧪 Password verification test:", passwordTest);

    return NextResponse.json({
      success: true,
      testUser: {
        id: testUser.id,
        email: testUser.email,
        hasPassword: !!testUser.password
      },
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        hasPassword: !!adminUser.password
      },
      passwordTest: passwordTest
    });

  } catch (error) {
    console.error("Manual user creation error:", error);
    return NextResponse.json(
      { error: "Failed to create users manually", details: error },
      { status: 500 }
    );
  }
}