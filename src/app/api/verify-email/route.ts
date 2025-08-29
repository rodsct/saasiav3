import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { sendWelcomeEmail } from "@/utils/emailService";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ 
        error: "Token de verificación requerido",
        verified: false 
      }, { status: 400 });
    }

    console.log(`🔍 Verifying email with token: ${token.substring(0, 8)}...`);

    // Find and validate verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json({ 
        error: "Token de verificación inválido o expirado",
        verified: false 
      }, { status: 400 });
    }

    // Check if token is expired
    if (new Date() > verificationToken.expires) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      
      return NextResponse.json({ 
        error: "Token de verificación expirado. Solicita un nuevo enlace.",
        verified: false 
      }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json({ 
        error: "Usuario no encontrado",
        verified: false 
      }, { status: 404 });
    }

    if (user.emailVerified) {
      // Delete token since email is already verified
      await prisma.verificationToken.delete({
        where: { token },
      });
      
      return NextResponse.json({ 
        message: "Email ya está verificado",
        verified: true 
      });
    }

    // Update user email verification and delete token
    await prisma.$transaction([
      prisma.user.update({
        where: { email: verificationToken.identifier },
        data: { emailVerified: new Date() }
      }),
      prisma.verificationToken.delete({
        where: { token }
      })
    ]);

    // Send welcome email after successful verification
    try {
      await sendWelcomeEmail(user.email, user.name || 'Usuario');
      console.log(`✅ Welcome email sent to verified user: ${user.email}`);
    } catch (emailError) {
      console.error(`❌ Failed to send welcome email to: ${user.email}`, emailError);
      // Don't fail verification if welcome email fails
    }

    console.log(`✅ Email verified successfully for: ${user.email}`);
    return NextResponse.json({ 
      message: "¡Email verificado exitosamente! Ya puedes iniciar sesión.",
      verified: true 
    });

  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        verified: false 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // For now, we'll just verify the email directly since we don't have a proper token system yet
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ 
        message: "Email already verified",
        verified: true 
      });
    }

    // Update user email verification
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() }
    });

    return NextResponse.json({ 
      message: "Email verified successfully",
      verified: true 
    });

  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}