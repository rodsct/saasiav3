import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

export async function GET(request: NextRequest) {
  try {
    // Check email templates
    const templates = await prisma.emailTemplate.findMany({
      select: {
        type: true,
        subject: true,
        isActive: true,
        createdAt: true,
      },
    });

    const diagnosis = {
      timestamp: new Date().toISOString(),
      templates: {
        count: templates.length,
        list: templates,
        status: templates.length > 0 ? "✅ Templates found" : "❌ No templates"
      },
      environment: {
        EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST ? "✅ SET" : "❌ NOT SET",
        EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER ? "✅ SET" : "❌ NOT SET", 
        EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD ? "✅ SET" : "❌ NOT SET"
      }
    };

    return NextResponse.json(diagnosis);
  } catch (error) {
    return NextResponse.json({ error: error?.toString() }, { status: 500 });
  }
}