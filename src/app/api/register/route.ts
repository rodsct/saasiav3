import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { triggerUserRegistered } from "@/utils/userEvents";

export async function POST(request: any) {
  const body = await request.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json("Missing Fields", { status: 400 });
  }

  const exist = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (exist) {
    return NextResponse.json("User already exists!", { status: 500 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    },
  });

  // Trigger welcome email
  try {
    await triggerUserRegistered(user.email, user.name, false);
    console.log(`✅ Welcome email triggered for user: ${user.email}`);
  } catch (error) {
    console.error(`❌ Failed to trigger welcome email for: ${user.email}`, error);
    // Don't fail user registration if email fails
  }

  return NextResponse.json("User created successfully!", { status: 200 });
}
