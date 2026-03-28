import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    // OTP-based authentication (Primary method)
    CredentialsProvider({
      id: "otp",
      name: "OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        console.log("🔐 NextAuth OTP authorize called for phone:", credentials?.phone);
        
        if (!credentials?.phone || !credentials?.otp) {
          console.error("❌ Missing phone or OTP");
          throw new Error("Phone and OTP required");
        }

        // Verify OTP
        const otpRecord = await prisma.otpVerification.findFirst({
          where: { phone: credentials.phone },
          orderBy: { createdAt: "desc" },
        });

        if (!otpRecord) {
          console.error("❌ No OTP record found for phone:", credentials.phone);
          throw new Error("Invalid or expired OTP");
        }

        console.log("📋 OTP Record found:", { 
          phone: otpRecord.phone, 
          attempts: otpRecord.attempts,
          expiresAt: otpRecord.expiresAt,
          otpMatch: otpRecord.otp === credentials.otp
        });

        // Check expiry
        if (otpRecord.expiresAt < new Date()) {
          console.error("❌ OTP expired");
          await prisma.otpVerification.delete({ where: { id: otpRecord.id } });
          throw new Error("OTP expired");
        }

        // Check attempts
        if (otpRecord.attempts >= 3) {
          console.error("❌ Maximum attempts exceeded");
          await prisma.otpVerification.delete({ where: { id: otpRecord.id } });
          throw new Error("Maximum attempts exceeded");
        }

        // Verify OTP
        if (otpRecord.otp !== credentials.otp) {
          console.error("❌ OTP mismatch");
          await prisma.otpVerification.update({
            where: { id: otpRecord.id },
            data: { attempts: otpRecord.attempts + 1 },
          });
          throw new Error("Invalid OTP");
        }

        console.log("✅ OTP verified, deleting record");
        // OTP is valid, delete it
        await prisma.otpVerification.delete({ where: { id: otpRecord.id } });

        // Find or create user
        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
        });

        if (!user) {
          console.error("❌ No user found for phone:", credentials.phone);
          throw new Error("No user found. Please sign up first.");
        }

        console.log("✅ User found:", { id: user.id, phone: user.phone, role: user.role });

        // Check if user is active
        if (!user.isActive) {
          console.error("❌ User account is deactivated");
          throw new Error("Account has been deactivated");
        }

        console.log("✅ Authorization successful");
        return {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
        };
      },
    }),
    
    // Password-based authentication (Fallback for admin/delivery users)
    CredentialsProvider({
      id: "password",
      name: "Password",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("Phone and password required");
        }

        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
        });

        if (!user) {
          throw new Error("No user found with this phone number");
        }

        if (!user.passwordHash) {
          throw new Error("This account uses OTP login. Please use OTP instead.");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error("Account has been deactivated");
        }

        return {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

