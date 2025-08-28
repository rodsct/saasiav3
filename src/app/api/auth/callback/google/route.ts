import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import jwt from "jsonwebtoken";
import { getSiteUrl, getOAuthCallbackUrl, buildUrl } from "@/utils/siteConfig";
import { triggerUserRegistered } from "@/utils/userEvents";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "simple-auth-secret-key";
const PRODUCTION_URL = getSiteUrl();

export async function GET(request: NextRequest) {
  console.log("Google OAuth callback received");
  
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  console.log("Code:", code ? "received" : "missing");
  console.log("Error:", error);

  if (error) {
    console.log("Google OAuth error:", error);
    return NextResponse.redirect(buildUrl("/signin?error=oauth_cancelled"));
  }

  if (!code) {
    console.log("No code parameter received");
    return NextResponse.redirect(buildUrl("/signin?error=no_code"));
  }

  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = getOAuthCallbackUrl("google");

    console.log("Processing Google OAuth callback with code:", code.substring(0, 20) + "...");

    // Exchange code for token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: googleClientId || "",
        client_secret: googleClientSecret || "",
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(buildUrl("/signin?error=token_exchange_failed"));
    }

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error("No access token received:", tokenData);
      return NextResponse.redirect(buildUrl("/signin?error=no_access_token"));
    }

    // Get user info from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error("Failed to get user info from Google");
      return NextResponse.redirect(buildUrl("/signin?error=user_info_failed"));
    }

    const googleUser = await userResponse.json();
    console.log("Google user info received for:", googleUser.email);

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      // Create new user from Google OAuth
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          subscription: "FREE", // Default subscription
          role: "USER",
          emailVerified: new Date(), // Google emails are verified
        },
      });
      console.log("Created new user:", user.email);
      
      // Trigger welcome email for new user (async, don't wait)
      triggerUserRegistered(user.email, user.name || undefined, false).catch(error => {
        console.error("Error triggering welcome email:", error);
      });
    } else {
      console.log("Found existing user:", user.email);
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Redirect to home page with auth cookie
    const response = NextResponse.redirect(buildUrl("/"));
    
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    console.log("OAuth successful, redirecting to home page");
    return response;

  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(buildUrl("/signin?error=oauth_error"));
  }
}