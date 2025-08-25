import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Redirect to Google OAuth
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = "http://localhost:3000/api/auth/callback/google";
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${googleClientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=openid%20email%20profile`;

  console.log("Redirecting to Google OAuth with URL:", authUrl);
  return NextResponse.redirect(authUrl);
}