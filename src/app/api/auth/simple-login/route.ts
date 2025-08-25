import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "simple-auth-secret-key";

export async function POST(request: NextRequest) {
  try {
    console.log("Simple login attempt started");
    const { email, password } = await request.json();
    console.log("Login attempt for email:", email);

    if (!email || !password) {
      console.log("Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    console.log("Searching for user in database...");
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        subscription: true,
        subscriptionEndsAt: true,
        role: true,
      },
    });

    console.log("User found:", user ? "Yes" : "No");
    if (!user) {
      console.log("User not found in database");
      
      // Auto-create test users if they don't exist
      if (email === "test@aranza.io" && password === "test123") {
        console.log("Creating test user automatically...");
        const hashedPassword = await bcrypt.hash("test123", 12);
        
        const newUser = await prisma.user.create({
          data: {
            email: "test@aranza.io",
            name: "Usuario de Pruebas PRO",
            password: hashedPassword,
            subscription: "PRO",
            subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            role: "USER"
          }
        });
        
        console.log("✅ Test user created automatically:", newUser.email);
        
        // Continue with the new user
        const user = newUser;
        
        // Create JWT token
        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            name: user.name,
            subscription: user.subscription,
            role: user.role,
          },
          JWT_SECRET,
          { expiresIn: "24h" }
        );

        // Create response with secure cookie
        const response = NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            subscription: user.subscription,
            subscriptionEndsAt: user.subscriptionEndsAt,
            role: user.role,
          },
        });

        // Set HTTP-only cookie
        response.cookies.set("auth-token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24, // 24 hours
          path: "/",
        });

        return response;
      }
      
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    if (!user.password) {
      console.log("User has no password (OAuth user?)");
      return NextResponse.json(
        { error: "User has no password. Please use social login." },
        { status: 401 }
      );
    }

    // Verify password
    console.log("Verifying password...");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid);
    
    if (!isPasswordValid) {
      console.log("Invalid password");
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Create response with secure cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        subscriptionEndsAt: user.subscriptionEndsAt,
        role: user.role,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Simple login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}