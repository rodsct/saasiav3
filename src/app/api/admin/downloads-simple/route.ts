import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

// Simplified admin downloads endpoint that just checks for rodsct@gmail.com as admin
export async function GET(request: NextRequest) {
  try {
    console.log("Simple admin downloads API called");
    
    // Simple auth check - just verify rodsct@gmail.com exists and is ADMIN
    const adminEmail = "rodsct@gmail.com";
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { role: true }
    });
    
    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
    
    console.log("Admin check passed, loading downloads");

    const downloads = await prisma.download.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { id: "desc" }
    });

    console.log("Downloads loaded successfully:", downloads.length);
    return NextResponse.json({ downloads });

  } catch (error) {
    console.error("Simple admin downloads error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Simple admin downloads POST called");
    
    // Simple auth check - just verify rodsct@gmail.com exists and is ADMIN
    const adminEmail = "rodsct@gmail.com";
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { id: true, role: true }
    });
    
    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const accessLevel = formData.get("accessLevel") as string;
    const category = formData.get("category") as string;
    const tags = formData.get("tags") as string;

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

    // Parse tags from comma-separated string
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

    const download = await prisma.download.create({
      data: {
        title,
        description: description || null,
        fileName,
        filePath,
        fileSize,
        mimeType,
        accessLevel: accessLevel as "PUBLIC" | "REGISTERED" | "PREMIUM",
        category: category || null,
        tags: tagsArray,
        userId: adminUser.id,
      }
    });

    console.log("File uploaded successfully:", download);
    return NextResponse.json({ download });

  } catch (error) {
    console.error("Simple admin upload error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}