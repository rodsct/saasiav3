import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Simple auth check using headers
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all email templates
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { type: 'asc' }
    });

    return NextResponse.json({
      success: true,
      templates: templates.map(template => ({
        id: template.id,
        type: template.type,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        isActive: template.isActive,
        variables: template.variables,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString()
      }))
    });

  } catch (error) {
    console.error("Get email templates error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Clean up
export async function OPTIONS() {
  await prisma.$disconnect();
  return NextResponse.json({ success: true });
}