import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

export async function GET(request: NextRequest) {
  try {
    const diagnosis = {
      timestamp: new Date().toISOString(),
      environment: {
        EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST || "❌ NOT SET",
        EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT || "❌ NOT SET",
        EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER || "❌ NOT SET",
        EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD ? "✅ SET" : "❌ NOT SET",
        EMAIL_FROM: process.env.EMAIL_FROM || "❌ NOT SET",
      },
      database: {},
      emailService: {}
    };

    // Check email templates in database
    try {
      const templates = await prisma.emailTemplate.findMany({
        select: {
          type: true,
          subject: true,
          isActive: true,
          createdAt: true,
        },
      });
      
      diagnosis.database = {
        templatesCount: templates.length,
        templates: templates.map(t => ({
          type: t.type,
          subject: t.subject.substring(0, 50) + "...",
          isActive: t.isActive,
          createdAt: t.createdAt,
        })),
        missingTemplates: templates.length === 0 ? "❌ NO TEMPLATES FOUND - NEED INITIALIZATION" : "✅ Templates found"
      };
    } catch (error) {
      diagnosis.database = {
        error: "❌ Database error: " + error?.toString()
      };
    }

    // Test email configuration
    diagnosis.emailService = {
      status: "Email configuration check",
      config: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        user: process.env.EMAIL_SERVER_USER ? "✅ SET" : "❌ NOT SET",
        pass: process.env.EMAIL_SERVER_PASSWORD ? "✅ SET" : "❌ NOT SET",
      },
      recommendations: []
    };

    // Add recommendations based on config
    if (!process.env.EMAIL_SERVER_HOST) {
      diagnosis.emailService.recommendations.push("❌ Set EMAIL_SERVER_HOST (e.g., smtp.gmail.com)");
    }
    if (!process.env.EMAIL_SERVER_USER) {
      diagnosis.emailService.recommendations.push("❌ Set EMAIL_SERVER_USER (your email)");
    }
    if (!process.env.EMAIL_SERVER_PASSWORD) {
      diagnosis.emailService.recommendations.push("❌ Set EMAIL_SERVER_PASSWORD (app password)");
    }
    if (diagnosis.emailService.recommendations.length === 0) {
      diagnosis.emailService.recommendations.push("✅ Email configuration looks complete");
    }

    return NextResponse.json(diagnosis, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error("Email debug error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error?.toString(),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}