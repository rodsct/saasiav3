import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const hashedPassword = await bcrypt.hash("test123", 12);
    
    // Calculate subscription end date (1 month from now)
    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);

    // Create test user with PRO subscription
    const testUser = await prisma.user.upsert({
      where: { email: "test@aranza.io" },
      update: {
        subscription: "PRO",
        subscriptionEndsAt: subscriptionEndsAt,
        role: "USER",
      },
      create: {
        email: "test@aranza.io",
        name: "Usuario de Prueba PRO",
        password: hashedPassword,
        subscription: "PRO",
        subscriptionEndsAt: subscriptionEndsAt,
        role: "USER",
      },
    });

    // Also create an admin user
    const adminUser = await prisma.user.upsert({
      where: { email: "admin@aranza.io" },
      update: {
        subscription: "PRO",
        subscriptionEndsAt: subscriptionEndsAt,
        role: "ADMIN",
      },
      create: {
        email: "admin@aranza.io",
        name: "Admin Aranza",
        password: hashedPassword,
        subscription: "PRO",
        subscriptionEndsAt: subscriptionEndsAt,
        role: "ADMIN",
      },
    });

    console.log("✅ Test users created successfully");

    return NextResponse.json({
      success: true,
      message: "Test users created successfully",
      users: [
        {
          email: "test@aranza.io",
          password: "test123",
          subscription: "PRO",
          role: "USER",
        },
        {
          email: "admin@aranza.io", 
          password: "test123",
          subscription: "PRO",
          role: "ADMIN",
        },
      ],
    });

  } catch (error) {
    console.error("Create test user error:", error);
    return NextResponse.json(
      { error: "Failed to create test users" },
      { status: 500 }
    );
  }
}