import { NextRequest, NextResponse } from "next/server";
import { getSiteUrl, getOAuthCallbackUrl } from "@/utils/siteConfig";

export async function GET(request: NextRequest) {
  // Get production URL from centralized configuration
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const PRODUCTION_URL = getSiteUrl();
  const redirectUri = getOAuthCallbackUrl("google");
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${googleClientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=openid%20email%20profile`;

  console.log("🚀 Redirecting to Google OAuth with PRODUCTION URL:", authUrl);
  return NextResponse.redirect(authUrl);
}