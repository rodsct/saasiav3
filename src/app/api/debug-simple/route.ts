import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hcaptcha_secret: process.env.HCAPTCHA_SECRET_KEY ? "SET" : "NOT SET",
    hcaptcha_public: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ? "SET" : "NOT SET",
    node_env: process.env.NODE_ENV || "not set",
    email_host: process.env.EMAIL_SERVER_HOST ? "SET" : "NOT SET",
    email_user: process.env.EMAIL_SERVER_USER ? "SET" : "NOT SET", 
    email_pass: process.env.EMAIL_SERVER_PASSWORD ? "SET" : "NOT SET",
    email_from: process.env.EMAIL_FROM || "not set",
    timestamp: new Date().toISOString()
  });
}