import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Simple auth check
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { to } = await request.json();

    if (!to) {
      return NextResponse.json({ error: "Email address required" }, { status: 400 });
    }

    console.log('🧪 Starting nodemailer test with dynamic import...');

    // Check environment variables first
    const requiredVars = {
      EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
      EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
      EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
      EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT || '587'
    };

    console.log('📋 Environment check:', {
      EMAIL_SERVER_HOST: !!requiredVars.EMAIL_SERVER_HOST,
      EMAIL_SERVER_USER: !!requiredVars.EMAIL_SERVER_USER,
      EMAIL_SERVER_PASSWORD: !!requiredVars.EMAIL_SERVER_PASSWORD,
      EMAIL_SERVER_PORT: requiredVars.EMAIL_SERVER_PORT
    });

    const missingVars = Object.entries(requiredVars)
      .filter(([key, value]) => key !== 'EMAIL_SERVER_PORT' && !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      return NextResponse.json({
        error: "Missing environment variables",
        missingVars
      }, { status: 500 });
    }

    try {
      // Import nodemailer using require (CommonJS)
      console.log('📦 Importing nodemailer...');
      const nodemailer = require('nodemailer');
      console.log('✅ Nodemailer imported successfully');
      console.log('🔍 Nodemailer object:', Object.keys(nodemailer));

      // Create transporter (try both methods)
      console.log('🔧 Creating transporter...');
      console.log('Available nodemailer methods:', Object.getOwnPropertyNames(nodemailer));
      
      let transporter;
      if (typeof nodemailer.createTransporter === 'function') {
        console.log('Using createTransporter...');
        transporter = nodemailer.createTransporter({
          host: requiredVars.EMAIL_SERVER_HOST,
          port: parseInt(requiredVars.EMAIL_SERVER_PORT),
          secure: parseInt(requiredVars.EMAIL_SERVER_PORT) === 465,
          auth: {
            user: requiredVars.EMAIL_SERVER_USER,
            pass: requiredVars.EMAIL_SERVER_PASSWORD,
          },
        });
      } else if (typeof nodemailer.createTransport === 'function') {
        console.log('Using createTransport...');
        transporter = nodemailer.createTransport({
          host: requiredVars.EMAIL_SERVER_HOST,
          port: parseInt(requiredVars.EMAIL_SERVER_PORT),
          secure: parseInt(requiredVars.EMAIL_SERVER_PORT) === 465,
          auth: {
            user: requiredVars.EMAIL_SERVER_USER,
            pass: requiredVars.EMAIL_SERVER_PASSWORD,
          },
        });
      } else {
        throw new Error('Neither createTransporter nor createTransport are available on nodemailer object');
      }
      
      if (!transporter) {
        throw new Error('Failed to create transporter');
      }
      
      console.log('✅ Transporter created');

      // Verify connection
      console.log('🔍 Verifying SMTP connection...');
      await transporter.verify();
      console.log('✅ SMTP connection verified');

      // Send test email
      console.log('📧 Sending test email to:', to);
      const info = await transporter.sendMail({
        from: `"Aranza.io Test" <${requiredVars.EMAIL_SERVER_USER}>`,
        to: to,
        subject: "✅ Test Email - Nodemailer Funcionando",
        text: "Este email confirma que nodemailer está funcionando correctamente.",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #00d4ff;">✅ Nodemailer Funcionando</h2>
            <p>Este email confirma que nodemailer está funcionando correctamente.</p>
            <p><strong>Configuración utilizada:</strong></p>
            <ul>
              <li>Host: ${requiredVars.EMAIL_SERVER_HOST}</li>
              <li>Puerto: ${requiredVars.EMAIL_SERVER_PORT}</li>
              <li>Usuario: ${requiredVars.EMAIL_SERVER_USER}</li>
            </ul>
            <p><small>Enviado el: ${new Date().toLocaleString()}</small></p>
          </div>
        `
      });

      console.log('✅ Email sent successfully:', info.messageId);

      return NextResponse.json({
        success: true,
        messageId: info.messageId,
        message: "Email de prueba enviado exitosamente",
        details: {
          host: requiredVars.EMAIL_SERVER_HOST,
          port: requiredVars.EMAIL_SERVER_PORT,
          user: requiredVars.EMAIL_SERVER_USER
        }
      });

    } catch (emailError) {
      console.error('❌ Email error:', emailError);
      
      return NextResponse.json({
        error: "Error sending email",
        details: emailError instanceof Error ? emailError.message : String(emailError)
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Request error:', error);
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}