import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prismaDB";
import { getSiteUrl, getOAuthCallbackUrl, isOwnDomain } from "./siteConfig";
import { triggerUserRegistered } from "./userEvents";

// Get production URL from centralized configuration
const PRODUCTION_URL = getSiteUrl();

// Ensure consistency across all URL environment variables
process.env.NEXTAUTH_URL = PRODUCTION_URL;
process.env.NEXTAUTH_URL_INTERNAL = PRODUCTION_URL;
process.env.SITE_URL = PRODUCTION_URL;

// Log for debugging
console.log("🔧 Forcing production URLs:");
console.log("  NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("  NEXTAUTH_URL_INTERNAL:", process.env.NEXTAUTH_URL_INTERNAL);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET || "nextauth-secret-development-key",
  
  // Force production URL for callbacks
  url: PRODUCTION_URL,
  
  // Custom redirect override
  redirectProxyUrl: PRODUCTION_URL,
  
  session: {
    strategy: "jwt",
  },
  
  providers: [
    {
      id: "google",
      name: "Google",
      type: "oauth",
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: {
          scope: "openid email profile",
          response_type: "code",
          redirect_uri: getOAuthCallbackUrl("google")
        }
      },
      token: "https://oauth2.googleapis.com/token",
      userinfo: "https://www.googleapis.com/oauth2/v2/userinfo",
      profile(profile: any) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          console.log(`🔍 Login attempt for: ${credentials.email}`);
          console.log(`👤 User found: ${user ? 'YES' : 'NO'}`);
          console.log(`🔑 Password exists: ${user?.password ? 'YES' : 'NO'}`);
          console.log(`✅ Email verified: ${user?.emailVerified ? 'YES' : 'NO'}`);

          if (!user || !user.password) {
            console.log(`❌ Login failed: User not found or no password`);
            return null;
          }

          // Check if email is verified (only for credential logins)
          if (!user.emailVerified) {
            console.log(`❌ Login denied for unverified email: ${user.email}`);
            throw new Error("Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          // Re-throw verification errors so they reach the frontend
          if (error instanceof Error && error.message.includes("verifica tu email")) {
            throw error;
          }
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      console.log(`🔐 SignIn callback - Provider: ${account?.provider}, Email: ${user?.email}`);
      
      // Handle OAuth providers explicitly (not email provider)
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // Create new user for OAuth providers
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || "Usuario OAuth",
                emailVerified: new Date(), // OAuth users have verified emails
                image: user.image,
              },
            });

            // Trigger welcome email for new OAuth users
            try {
              await triggerUserRegistered(newUser.email, newUser.name, false);
              console.log(`✅ Welcome email triggered for OAuth user: ${newUser.email}`);
            } catch (error) {
              console.error(`❌ Failed to trigger welcome email for OAuth user: ${newUser.email}`, error);
            }
          } else if (!existingUser.emailVerified) {
            // Update email verification for existing users
            await prisma.user.update({
              where: { email: user.email! },
              data: { emailVerified: new Date() }
            });
          }
        } catch (error) {
          console.error("Error in OAuth signIn callback:", error);
        }
      }
      
      // Let PrismaAdapter handle email provider automatically
      console.log(`✅ SignIn approved for ${account?.provider} provider`);
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log("🔀 Redirect callback - url:", url, "baseUrl:", baseUrl, "prodUrl:", PRODUCTION_URL);
      
      
      // Force production URL for all redirects
      if (url.startsWith("/")) {
        const finalUrl = `${PRODUCTION_URL}${url}`;
        console.log("🔀 Redirecting to:", finalUrl);
        return finalUrl;
      }
      
      // If it's a localhost URL, replace with production URL
      if (url.includes("localhost")) {
        const finalUrl = url.replace(/http:\/\/localhost:\d+/, PRODUCTION_URL);
        console.log("🔀 Replacing localhost with:", finalUrl);
        return finalUrl;
      }
      
      // If it's the old EasyPanel URL, redirect to new domain
      if (url.includes("proyectonuevo-saasiav3.uclxiv.easypanel.host")) {
        const finalUrl = url.replace("https://proyectonuevo-saasiav3.uclxiv.easypanel.host", PRODUCTION_URL);
        console.log("🔀 Replacing old domain with:", finalUrl);
        return finalUrl;
      }
      
      // Allow production URL domain
      if (isOwnDomain(url)) return url;
      
      console.log("🔀 Default redirect to production URL:", PRODUCTION_URL);
      return PRODUCTION_URL;
    },
    async jwt({ token, user }) {
      // If user is provided (first time), add user info to token
      if (user) {
        token.id = user.id;
        token.subscription = user.subscription || "FREE";
        token.subscriptionEndsAt = user.subscriptionEndsAt;
        token.role = user.role || "USER";
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).subscription = token.subscription || "FREE";
        (session.user as any).subscriptionEndsAt = token.subscriptionEndsAt;
        (session.user as any).role = token.role || "USER";
      }
      return session;
    },
  },


  pages: {
    signIn: "/signin",
    error: "/auth/error"
  },
};
