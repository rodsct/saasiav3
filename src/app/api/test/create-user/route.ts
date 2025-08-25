import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    console.log("Creating test users...");

    // Create test user PRO
    const testUserEmail = "test@aranza.io";
    const adminUserEmail = "admin@aranza.io";
    const password = "test123";
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if test user exists
    const existingTestUser = await prisma.user.findUnique({
      where: { email: testUserEmail }
    });

    if (!existingTestUser) {
      await prisma.user.create({
        data: {
          email: testUserEmail,
          name: "Usuario de Pruebas PRO",
          password: hashedPassword,
          subscription: "pro",
          subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          role: "user",
        }
      });
      console.log("Test PRO user created");
    } else {
      console.log("Test PRO user already exists");
    }

    // Check if admin user exists
    const existingAdminUser = await prisma.user.findUnique({
      where: { email: adminUserEmail }
    });

    if (!existingAdminUser) {
      await prisma.user.create({
        data: {
          email: adminUserEmail,
          name: "Administrator",
          password: hashedPassword,
          subscription: "pro",
          subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          role: "admin",
        }
      });
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists");
    }

    return NextResponse.json({
      success: true,
      message: "Test users created/verified successfully",
      users: [
        { email: testUserEmail, role: "user", subscription: "pro" },
        { email: adminUserEmail, role: "admin", subscription: "pro" }
      ]
    });

  } catch (error) {
    console.error("Error creating test users:", error);
    return NextResponse.json(
      { error: "Failed to create test users", details: error },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check existing users
    const testUser = await prisma.user.findUnique({
      where: { email: "test@aranza.io" },
      select: { id: true, email: true, name: true, subscription: true, role: true, password: true }
    });

    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@aranza.io" },
      select: { id: true, email: true, name: true, subscription: true, role: true, password: true }
    });

    return NextResponse.json({
      testUser: testUser ? {
        ...testUser,
        hasPassword: !!testUser.password
      } : null,
      adminUser: adminUser ? {
        ...adminUser,
        hasPassword: !!adminUser.password
      } : null,
      databaseConnected: true
    });

  } catch (error) {
    console.error("Database check error:", error);
    return NextResponse.json(
      { error: "Database connection failed", details: error },
      { status: 500 }
    );
  }
}