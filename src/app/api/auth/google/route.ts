import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Force production URL for Google OAuth
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const PRODUCTION_URL = "https://proyectonuevo-saasiav3.uclxiv.easypanel.host";
  const redirectUri = `${PRODUCTION_URL}/api/auth/callback/google`;
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${googleClientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=openid%20email%20profile`;

  console.log("🚀 Redirecting to Google OAuth with PRODUCTION URL:", authUrl);
  return NextResponse.redirect(authUrl);
}