import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const debug = {
      timestamp: new Date().toISOString(),
      environment: {
        NEXT_PUBLIC_HCAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "NOT_SET",
        HCAPTCHA_SECRET_KEY: process.env.HCAPTCHA_SECRET_KEY ? "SET" : "NOT_SET"
      },
      test_math_captcha: {
        num1: 5,
        num2: 3,
        operation: '+',
        question: '¿Cuánto es 5 + 3?',
        answer: 8
      },
      status: "Debug endpoint working"
    };

    return NextResponse.json(debug);
  } catch (error) {
    return NextResponse.json({
      error: "Debug error: " + error?.toString()
    }, { status: 500 });
  }
}