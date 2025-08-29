import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import nodemailer from 'nodemailer';
import { getSiteUrl } from "@/utils/siteConfig";

// Create transporter (same as working sendTestEmail)
function createTransporter(): nodemailer.Transporter | null {
  try {
    const host = process.env.EMAIL_SERVER_HOST;
    const port = parseInt(process.env.EMAIL_SERVER_PORT || '587');
    const user = process.env.EMAIL_SERVER_USER;
    const pass = process.env.EMAIL_SERVER_PASSWORD;

    if (!host || !user || !pass) {
      console.warn('Email configuration incomplete');
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  } catch (error) {
    console.error('Error creating transporter:', error);
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { emailType } = await request.json();
    const userId = params.id;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const transporter = createTransporter();
    if (!transporter) {
      return NextResponse.json({ error: "Email configuration error" }, { status: 500 });
    }

    const senderName = 'Aranza.io';
    const senderAddress = process.env.EMAIL_SERVER_USER || 'noreply@agente.aranza.io';
    const userName = user.name || 'Usuario';
    const siteUrl = getSiteUrl();

    let subject = '';
    let htmlContent = '';

    if (emailType === 'welcome') {
      subject = `¡Bienvenido a ${senderName}!`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #00d4ff; margin: 0;">¡Bienvenido a ${senderName}!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Hola ${userName},</h2>
            <p style="color: #666; line-height: 1.6;">
              ¡Gracias por unirte a nuestra comunidad! Tu cuenta ha sido creada exitosamente.
            </p>
            <p style="color: #666; line-height: 1.6;">
              Ahora puedes acceder a todas las funciones de nuestra plataforma de IA y automatizaciones.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${siteUrl}" style="display: inline-block; background: #00d4ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Comenzar Ahora
            </a>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} ${senderName}. Todos los derechos reservados.<br>
            <a href="${siteUrl}" style="color: #00d4ff;">${siteUrl}</a>
          </p>
        </div>
      `;
    } else if (emailType === 'verification') {
      subject = `Verifica tu email - ${senderName}`;
      const verificationUrl = `${siteUrl}/verify-email?email=${encodeURIComponent(user.email)}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #00d4ff; margin: 0;">Verificación de Email</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Hola ${userName},</h2>
            <p style="color: #666; line-height: 1.6;">
              Para completar tu registro en ${senderName}, necesitamos verificar tu dirección de email.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background: #00d4ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verificar Email
            </a>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} ${senderName}. Todos los derechos reservados.
          </p>
        </div>
      `;
    } else {
      return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
    }

    const mailOptions = {
      from: `"${senderName}" <${senderAddress}>`,
      to: user.email,
      subject,
      html: htmlContent
    };

    console.log(`📤 Sending direct ${emailType} email to:`, user.email);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Direct email sent successfully:', result.messageId);

    return NextResponse.json({ 
      success: true, 
      message: `Direct ${emailType} email sent successfully`,
      sentTo: user.email,
      messageId: result.messageId
    });

  } catch (error) {
    console.error("Send direct email error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.toString() },
      { status: 500 }
    );
  }
}