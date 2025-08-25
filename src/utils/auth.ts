import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "./prismaDB";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "nextauth-secret-development-key",
  
  // Force production URL for callbacks
  url: process.env.NEXTAUTH_URL || "https://proyectonuevo-saasiav3.uclxiv.easypanel.host",
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
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
    async redirect({ url, baseUrl }) {
      const prodUrl = process.env.NEXTAUTH_URL || "https://proyectonuevo-saasiav3.uclxiv.easypanel.host";
      console.log("🔀 Redirect callback - url:", url, "baseUrl:", baseUrl, "prodUrl:", prodUrl);
      
      // Force production URL for all redirects
      if (url.startsWith("/")) {
        const finalUrl = `${prodUrl}${url}`;
        console.log("🔀 Redirecting to:", finalUrl);
        return finalUrl;
      }
      
      // If it's a localhost URL, replace with production URL
      if (url.includes("localhost")) {
        const finalUrl = url.replace(/http:\/\/localhost:\d+/, prodUrl);
        console.log("🔀 Replacing localhost with:", finalUrl);
        return finalUrl;
      }
      
      // Allow prodUrl domain
      if (new URL(url).origin === prodUrl) return url;
      
      console.log("🔀 Default redirect to prodUrl:", prodUrl);
      return prodUrl;
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
