import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const debug = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || "NOT_SET",
        NEXT_PUBLIC_HCAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "NOT_SET",
        HCAPTCHA_SECRET_KEY: process.env.HCAPTCHA_SECRET_KEY ? "SET" : "NOT_SET",
        // Check all environment variables that start with NEXT_PUBLIC_
        all_next_public_vars: Object.keys(process.env)
          .filter(key => key.startsWith('NEXT_PUBLIC_'))
          .reduce((acc, key) => {
            acc[key] = process.env[key] || "NOT_SET";
            return acc;
          }, {} as Record<string, string>),
        // Check if hCaptcha vars exist with different names
        possible_hcaptcha_vars: Object.keys(process.env)
          .filter(key => key.toLowerCase().includes('captcha') || key.toLowerCase().includes('hcaptcha'))
          .reduce((acc, key) => {
            acc[key] = process.env[key] ? `SET (${process.env[key]?.substring(0, 10)}...)` : "NOT_SET";
            return acc;
          }, {} as Record<string, string>)
      },
      client_check: {
        // This will be available on client-side
        client_side_key: typeof window !== 'undefined' ? 
          (window as any)?.process?.env?.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "NOT_AVAILABLE_ON_SERVER" :
          "RUNNING_ON_SERVER"
      },
      status: "Debug endpoint working - checking hCaptcha configuration"
    };

    return NextResponse.json(debug);
  } catch (error) {
    return NextResponse.json({
      error: "Debug error: " + error?.toString()
    }, { status: 500 });
  }
}