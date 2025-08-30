import nodemailer from 'nodemailer';
import { getSiteUrl } from './siteConfig';

// Create simple email transporter
function createSimpleTransporter() {
  try {
    const host = process.env.EMAIL_SERVER_HOST;
    const port = parseInt(process.env.EMAIL_SERVER_PORT || '587');
    const user = process.env.EMAIL_SERVER_USER;
    const pass = process.env.EMAIL_SERVER_PASSWORD;

    console.log('📧 Email config:', {
      host: host ? 'SET' : 'NOT SET',
      port,
      user: user ? 'SET' : 'NOT SET',
      pass: pass ? 'SET' : 'NOT SET'
    });

    if (!host || !user || !pass) {
      console.warn('❌ Email configuration incomplete. Missing EMAIL_SERVER_* variables');
      return null;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    console.log('✅ Simple email transporter created');
    return transporter;
  } catch (error) {
    console.error('❌ Error creating simple email transporter:', error);
    return null;
  }
}

export async function sendSimpleVerificationEmail(
  userEmail: string,
  verificationUrl: string,
  userName?: string
): Promise<boolean> {
  try {
    console.log(`📧 Sending simple verification email to: ${userEmail}`);

    const transporter = createSimpleTransporter();
    if (!transporter) {
      console.error('❌ No email transporter available');
      return false;
    }

    const senderName = 'Aranza.io';
    const senderAddress = process.env.EMAIL_SERVER_USER || process.env.EMAIL_FROM || 'noreply@agente.aranza.io';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verifica tu cuenta - Aranza.io</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">¡Bienvenido a Aranza.io! 🚀</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hola ${userName || 'Usuario'}!</h2>
          
          <p>Gracias por registrarte en <strong>Aranza.io</strong>, tu asistente de inteligencia artificial.</p>
          
          <p>Para completar tu registro y activar tu cuenta, necesitas verificar tu dirección de email:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; background: #00d4ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
              ✅ Verificar mi cuenta
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
            <a href="${verificationUrl}" style="color: #00d4ff; word-break: break-all;">${verificationUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Este enlace expirará en 24 horas por motivos de seguridad.<br>
            Si no solicitaste esta cuenta, puedes ignorar este email.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Aranza.io - Tu asistente de IA</p>
          <p><a href="${getSiteUrl()}" style="color: #00d4ff;">${getSiteUrl()}</a></p>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Hola ${userName || 'Usuario'}!

Gracias por registrarte en Aranza.io, tu asistente de inteligencia artificial.

Para completar tu registro y activar tu cuenta, verifica tu email visitando:
${verificationUrl}

Este enlace expirará en 24 horas por motivos de seguridad.

Si no solicitaste esta cuenta, puedes ignorar este email.

© ${new Date().getFullYear()} Aranza.io
${getSiteUrl()}
    `;

    const mailOptions = {
      from: `"${senderName}" <${senderAddress}>`,
      to: userEmail,
      subject: '🚀 Verifica tu cuenta en Aranza.io',
      html: htmlContent,
      text: textContent,
    };

    console.log('📤 Sending verification email...', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent successfully:', result.messageId);
    return true;

  } catch (error) {
    console.error('❌ Error sending simple verification email:', error);
    return false;
  }
}

export async function sendSimplePasswordResetEmail(
  userEmail: string,
  resetUrl: string,
  userName?: string
): Promise<boolean> {
  try {
    console.log(`📧 Sending simple password reset email to: ${userEmail}`);

    const transporter = createSimpleTransporter();
    if (!transporter) {
      console.error('❌ No email transporter available');
      return false;
    }

    const senderName = 'Aranza.io';
    const senderAddress = process.env.EMAIL_SERVER_USER || process.env.EMAIL_FROM || 'noreply@agente.aranza.io';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Restablece tu contraseña - Aranza.io</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🔐 Restablece tu contraseña</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hola ${userName || 'Usuario'}!</h2>
          
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Aranza.io</strong>.</p>
          
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: #00d4ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
              🔑 Restablecer contraseña
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
            <a href="${resetUrl}" style="color: #00d4ff; word-break: break-all;">${resetUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Este enlace expirará en 10 minutos por motivos de seguridad.<br>
            Si no solicitaste este restablecimiento, puedes ignorar este email.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Aranza.io - Tu asistente de IA</p>
          <p><a href="${getSiteUrl()}" style="color: #00d4ff;">${getSiteUrl()}</a></p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${senderName}" <${senderAddress}>`,
      to: userEmail,
      subject: '🔐 Restablece tu contraseña en Aranza.io',
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully:', result.messageId);
    return true;

  } catch (error) {
    console.error('❌ Error sending simple password reset email:', error);
    return false;
  }
}