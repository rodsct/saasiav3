import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Simple auth check
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('🔍 Starting email debug diagnostics...');

    // Step 1: Check environment variables
    const envVars = {
      EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
      EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT || '587',
      EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
      EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD ? '***SET***' : undefined,
    };

    console.log('📋 Environment variables:', envVars);

    const missingVars = Object.entries(envVars)
      .filter(([key, value]) => key !== 'EMAIL_SERVER_PORT' && !value)
      .map(([key]) => key);

    // Step 2: Try to create nodemailer transporter
    let transporterError = null;
    let transporterCreated = false;

    try {
      const nodemailer = await import('nodemailer');
      
      if (missingVars.length === 0) {
        const config = {
          host: envVars.EMAIL_SERVER_HOST,
          port: parseInt(envVars.EMAIL_SERVER_PORT),
          secure: parseInt(envVars.EMAIL_SERVER_PORT) === 465,
          auth: {
            user: envVars.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        };

        console.log('⚙️ Attempting to create transporter with config:', {
          ...config,
          auth: { ...config.auth, pass: '***' }
        });

        const transporter = nodemailer.default.createTransporter(config);
        
        // Test connection
        await transporter.verify();
        transporterCreated = true;
        console.log('✅ Transporter created and verified successfully');
      }
    } catch (error) {
      transporterError = error instanceof Error ? error.message : String(error);
      console.error('❌ Transporter error:', transporterError);
    }

    // Step 3: Check database connection
    let dbError = null;
    let dbConnected = false;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      await prisma.$connect();
      dbConnected = true;
      console.log('✅ Database connection successful');
      
      await prisma.$disconnect();
    } catch (error) {
      dbError = error instanceof Error ? error.message : String(error);
      console.error('❌ Database error:', dbError);
    }

    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        variables: envVars,
        missingVars,
        allVarsPresent: missingVars.length === 0
      },
      transporter: {
        created: transporterCreated,
        error: transporterError
      },
      database: {
        connected: dbConnected,
        error: dbError
      },
      summary: {
        canSendEmail: transporterCreated && missingVars.length === 0,
        issues: []
      }
    };

    // Add issues to summary
    if (missingVars.length > 0) {
      diagnostics.summary.issues.push(`Missing environment variables: ${missingVars.join(', ')}`);
    }
    if (transporterError) {
      diagnostics.summary.issues.push(`Transporter error: ${transporterError}`);
    }
    if (dbError) {
      diagnostics.summary.issues.push(`Database error: ${dbError}`);
    }

    console.log('📊 Final diagnostics:', diagnostics);

    return NextResponse.json({
      success: true,
      diagnostics
    });

  } catch (error) {
    console.error("Email debug error:", error);
    return NextResponse.json(
      { 
        error: "Debug failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

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

    console.log('🧪 Starting simple email test to:', to);

    // Try the most basic email send possible
    try {
      const nodemailer = await import('nodemailer');
      
      const transporter = nodemailer.default.createTransporter({
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        secure: parseInt(process.env.EMAIL_SERVER_PORT || '587') === 465,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

      console.log('📧 Sending basic test email...');

      const info = await transporter.sendMail({
        from: `"Test Sender" <${process.env.EMAIL_SERVER_USER}>`,
        to: to,
        subject: "Basic Test Email",
        text: "This is a basic test email to verify SMTP functionality.",
        html: "<h1>Test Email</h1><p>This is a basic test email to verify SMTP functionality.</p>"
      });

      console.log('✅ Email sent successfully:', info.messageId);

      return NextResponse.json({
        success: true,
        messageId: info.messageId,
        message: "Basic test email sent successfully"
      });

    } catch (error) {
      console.error('❌ Email send error:', error);
      return NextResponse.json(
        { 
          error: "Failed to send email",
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Email debug POST error:", error);
    return NextResponse.json(
      { 
        error: "Debug test failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}