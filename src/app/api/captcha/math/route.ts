import { NextRequest, NextResponse } from "next/server";
import { generateMathCaptcha } from "@/utils/captcha";

export async function GET(request: NextRequest) {
  try {
    const captcha = generateMathCaptcha();
    
    return NextResponse.json({
      question: captcha.question,
      // Don't send the answer to the client!
      // The answer will be verified on the server during registration
      answer: captcha.answer // This is just for server-side verification
    });
    
  } catch (error) {
    console.error('Error generating math captcha:', error);
    return NextResponse.json(
      { error: "Error generating captcha" },
      { status: 500 }
    );
  }
}