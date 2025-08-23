import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { requireAdmin } from "@/utils/adminAuth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { id } = await params;

    const download = await prisma.download.findUnique({
      where: { id }
    });

    if (!download) {
      return NextResponse.json(
        { error: "Download not found" },
        { status: 404 }
      );
    }

    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      const fullFilePath = path.join(process.cwd(), 'public', download.filePath);
      await fs.unlink(fullFilePath);
    } catch (fileError) {
      console.warn("File deletion error:", fileError);
    }

    await prisma.download.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Admin delete download error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { id } = await params;
    const { title, description, isPublic } = await request.json();

    const download = await prisma.download.update({
      where: { id },
      data: {
        title,
        description,
        isPublic,
      }
    });

    return NextResponse.json({ download });

  } catch (error) {
    console.error("Admin update download error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}