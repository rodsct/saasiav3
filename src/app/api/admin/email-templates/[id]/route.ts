import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  
  try {
    // Simple auth check using headers
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, htmlContent, textContent, isActive } = await request.json();
    const templateId = params.id;

    // Validate required fields
    if (!subject || !htmlContent) {
      return NextResponse.json(
        { error: "Subject and HTML content are required" },
        { status: 400 }
      );
    }

    // Update email template
    const updatedTemplate = await prisma.emailTemplate.update({
      where: { id: templateId },
      data: {
        subject,
        htmlContent,
        textContent: textContent || null,
        isActive: Boolean(isActive),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Template updated successfully",
      template: {
        id: updatedTemplate.id,
        type: updatedTemplate.type,
        subject: updatedTemplate.subject,
        htmlContent: updatedTemplate.htmlContent,
        textContent: updatedTemplate.textContent,
        isActive: updatedTemplate.isActive,
        variables: updatedTemplate.variables,
        updatedAt: updatedTemplate.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error("Update email template error:", error);
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

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