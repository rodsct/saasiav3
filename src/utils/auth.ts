import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
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
  secret: process.env.NEXTAUTH_SECRET || "nextauth-secret-development-key",
  
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

          console.log(`🔐 Password validation result: ${isPasswordValid ? 'VALID' : 'INVALID'}`);

          if (!isPasswordValid) {
            console.log(`❌ Login failed: Invalid password for ${user.email}`);
            return null;
          }

          const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            subscription: user.subscription,
            subscriptionEndsAt: user.subscriptionEndsAt,
            role: user.role,
          };
          
          console.log(`✅ Credentials authorize successful for: ${user.email}`);
          return userData;
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
      
      // For OAuth providers, handle user creation/update
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // Create new user
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || "Usuario OAuth",
                emailVerified: new Date(),
                image: user.image,
              },
            });

            console.log(`✅ Created new OAuth user: ${newUser.email}`);
          } else if (!existingUser.emailVerified) {
            // Update email verification
            await prisma.user.update({
              where: { email: user.email! },
              data: { emailVerified: new Date() }
            });
            console.log(`✅ Updated email verification for: ${existingUser.email}`);
          }
        } catch (error) {
          console.error("Error in OAuth signIn:", error);
          return false; // Fail the sign in if database error
        }
      }
      
      console.log(`✅ SignIn approved for ${account?.provider}`);
      return true;
    },
    
    async jwt({ token, user, account }) {
      console.log(`🔑 JWT callback - User: ${user?.email || 'EXISTING'}, Account: ${account?.provider || 'N/A'}`);
      
      // On first sign in, add user info to token
      if (user) {
        console.log(`📝 Adding user data to JWT for: ${user.email}`);
        
        // For OAuth users, get data from database
        if (account?.provider === "google" || account?.provider === "github") {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email! },
            });
            
            if (dbUser) {
              token.id = dbUser.id;
              token.email = dbUser.email;
              token.name = dbUser.name;
              token.image = dbUser.image;
              token.subscription = dbUser.subscription || "FREE";
              token.role = dbUser.role || "USER";
              console.log(`✅ OAuth token populated from DB for: ${dbUser.email}`);
            }
          } catch (error) {
            console.error("Error fetching OAuth user from DB:", error);
          }
        } else if (account?.provider === "credentials") {
          // For credentials, use data from authorize function
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.image = user.image;
          token.subscription = (user as any).subscription || "FREE";
          token.role = (user as any).role || "USER";
          console.log(`✅ Credentials token populated for: ${user.email}`);
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      console.log(`📋 Session callback - Token exists: ${!!token}, Email: ${token?.email || 'N/A'}`);
      
      // Send properties to the client
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).email = token.email;
        (session.user as any).name = token.name;
        (session.user as any).image = token.image;
        (session.user as any).subscription = token.subscription || "FREE";
        (session.user as any).role = token.role || "USER";
        
        console.log(`✅ Session populated for: ${token.email}`);
      } else {
        console.log(`❌ Session callback failed - missing token or session.user`);
      }
      
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      console.log("🔀 Redirect:", url);
      
      // Force production URL for all redirects
      if (url.startsWith("/")) return `${PRODUCTION_URL}${url}`;
      if (url.includes("localhost")) return url.replace(/http:\/\/localhost:\d+/, PRODUCTION_URL);
      if (isOwnDomain(url)) return url;
      
      return PRODUCTION_URL;
    },
  },


  pages: {
    signIn: "/signin",
    error: "/auth/error"
  },
};
