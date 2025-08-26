import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "./prismaDB";

// Force production URL in environment - Override any .env values
const PRODUCTION_URL = "https://proyectonuevo-saasiav3.uclxiv.easypanel.host";

// Aggressively override ALL URL environment variables
process.env.NEXTAUTH_URL = PRODUCTION_URL;
process.env.NEXTAUTH_URL_INTERNAL = PRODUCTION_URL;
process.env.NEXT_PUBLIC_SITE_URL = PRODUCTION_URL;
process.env.SITE_URL = PRODUCTION_URL;

// Log for debugging
console.log("🔧 Forcing production URLs:");
console.log("  NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("  NEXTAUTH_URL_INTERNAL:", process.env.NEXTAUTH_URL_INTERNAL);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "nextauth-secret-development-key",
  
  // Force production URL for callbacks
  url: PRODUCTION_URL,
  
  // Custom redirect override
  redirectProxyUrl: PRODUCTION_URL,
  
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
          redirect_uri: `${PRODUCTION_URL}/api/auth/callback/google`
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

          if (!user || !user.password) {
            return null;
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
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("🔐 SignIn callback - account:", account?.provider);
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
      
      // Allow production URL domain
      if (url.includes("proyectonuevo-saasiav3.uclxiv.easypanel.host")) return url;
      
      console.log("🔀 Default redirect to production URL:", PRODUCTION_URL);
      return PRODUCTION_URL;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        
        // Get current user data including subscription
        try {
          const userData = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              subscription: true,
              subscriptionEndsAt: true,
              role: true,
            },
          });
          
          (session.user as any).subscription = userData?.subscription || "FREE";
          (session.user as any).subscriptionEndsAt = userData?.subscriptionEndsAt;
          (session.user as any).role = userData?.role || "USER";
        } catch (error) {
          console.error("Session callback error:", error);
          (session.user as any).subscription = "FREE";
          (session.user as any).role = "USER";
        }
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
  },
};
