import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { requireAdmin } from "@/utils/adminAuth";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const downloads = await prisma.download.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ downloads });

  } catch (error) {
    console.error("Admin get downloads error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const isPublic = formData.get("isPublic") === "true";

    if (!file || !title) {
      return NextResponse.json(
        { error: "File and title are required" },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const fileSize = file.size;
    const mimeType = file.type;
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const filePath = `uploads/admin/${Date.now()}-${fileName}`;
    
    const fs = require('fs').promises;
    const path = require('path');
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'admin');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const fullFilePath = path.join(process.cwd(), 'public', filePath);
    await fs.writeFile(fullFilePath, buffer);

    const download = await prisma.download.create({
      data: {
        title,
        description,
        fileName,
        filePath,
        fileSize,
        mimeType,
        isPublic,
        userId: adminCheck.id,
      }
    });

    return NextResponse.json({ download });

  } catch (error) {
    console.error("Admin upload file error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}