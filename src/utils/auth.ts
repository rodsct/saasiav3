import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prismaDB";
import { getSiteUrl } from "./siteConfig";
import { triggerUserRegistered } from "./userEvents";

// Production URL for callbacks
const PRODUCTION_URL = getSiteUrl();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET || "nextauth-secret-development-key",
  
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: "/signin",
    error: "/auth/error"
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        try {
          console.log(`🔍 Login attempt for: ${credentials.email}`);
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            console.log(`❌ User not found or no password: ${credentials.email}`);
            return null;
          }

          if (!user.emailVerified) {
            console.log(`❌ Email not verified: ${credentials.email}`);
            throw new Error("Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log(`❌ Invalid password for: ${credentials.email}`);
            return null;
          }

          console.log(`✅ Login successful for: ${credentials.email}`);
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Auth error:", error);
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
      console.log(`🔐 SignIn attempt - Provider: ${account?.provider}, Email: ${user?.email}`);
      
      try {
        // For OAuth providers, ensure user exists in database
        if (account?.provider === "google" || account?.provider === "github") {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            console.log(`👤 Creating new user for ${account.provider}: ${user.email}`);
            
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || `Usuario ${account.provider}`,
                emailVerified: new Date(), // OAuth users have verified emails
                image: user.image,
                role: "USER",
                subscription: "FREE",
              },
            });

            // Send welcome email (async, don't wait)
            triggerUserRegistered(newUser.email, newUser.name, false).catch(err => 
              console.error("Failed to send welcome email:", err)
            );
          } else {
            // Update existing user's info if needed
            if (!existingUser.emailVerified) {
              await prisma.user.update({
                where: { email: user.email! },
                data: { 
                  emailVerified: new Date(),
                  name: user.name || existingUser.name,
                  image: user.image || existingUser.image,
                }
              });
            }
          }
        }

        console.log(`✅ SignIn approved for: ${user.email}`);
        return true;
      } catch (error) {
        console.error(`❌ SignIn error for ${user.email}:`, error);
        return false;
      }
    },

    async session({ session, user }) {
      console.log(`📋 Session callback for: ${user?.email || session?.user?.email}`);
      
      if (user && session.user) {
        // Add user properties to session
        (session.user as any).id = user.id;
        (session.user as any).role = user.role || "USER";
        (session.user as any).subscription = user.subscription || "FREE";
        (session.user as any).subscriptionEndsAt = user.subscriptionEndsAt;
        
        console.log(`✅ Session populated for: ${user.email}`);
      }
      
      return session;
    },

    async redirect({ url, baseUrl }) {
      console.log(`🔀 Redirect: ${url} -> ${baseUrl}`);
      
      // Ensure we always redirect to production URL
      if (url.startsWith("/")) return `${PRODUCTION_URL}${url}`;
      if (url.startsWith(PRODUCTION_URL)) return url;
      
      // Default to home page
      return PRODUCTION_URL;
    },
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`📊 SignIn event - User: ${user.email}, New: ${isNewUser}, Provider: ${account?.provider}`);
    },
    
    async signOut({ session, token }) {
      console.log(`📊 SignOut event - User: ${(session?.user as any)?.email || (token as any)?.email}`);
    },
  },

  logger: {
    error(code, metadata) {
      console.error(`NextAuth Error [${code}]:`, metadata);
    },
    warn(code) {
      console.warn(`NextAuth Warning [${code}]`);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log(`NextAuth Debug [${code}]:`, metadata);
      }
    },
  },
};