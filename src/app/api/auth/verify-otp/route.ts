import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { phone, otp, action, name } = await request.json();

    // Validate inputs
    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone and OTP are required" },
        { status: 400 }
      );
    }

    // Find OTP record
    const otpRecord = await prisma.otpVerification.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No OTP found. Please request a new one." },
        { status: 404 }
      );
    }

    // Check if OTP expired
    if (otpRecord.expiresAt < new Date()) {
      await prisma.otpVerification.delete({
        where: { id: otpRecord.id },
      });
      return NextResponse.json(
        { error: "OTP expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      await prisma.otpVerification.delete({
        where: { id: otpRecord.id },
      });
      return NextResponse.json(
        { error: "Maximum attempts exceeded. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      // Increment attempts
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });

      return NextResponse.json(
        {
          error: "Invalid OTP",
          attemptsLeft: 3 - (otpRecord.attempts + 1),
        },
        { status: 400 }
      );
    }

    // OTP verified successfully
    
    // Handle different actions
    if (action === 'signup') {
      // For signup, DON'T delete OTP yet - we need it for auto-login
      // It will be deleted when the auto-login happens
      // Create new user for signup
      const existingUser = await prisma.user.findUnique({
        where: { phone },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "User already exists. Please login instead." },
          { status: 409 }
        );
      }

      const newUser = await prisma.user.create({
        data: {
          phone,
          name: name || null,
          role: "CUSTOMER",
          isActive: true,
          passwordHash: null, // Passwordless
        },
        select: {
          id: true,
          phone: true,
          name: true,
          role: true,
        },
      });

      // DON'T delete OTP yet - keep it for auto-login
      // The NextAuth provider will verify and delete it

      return NextResponse.json({
        success: true,
        message: "Account created successfully! Please login.",
        action: 'signup',
        user: newUser,
        canAutoLogin: true, // Flag to indicate auto-login is possible
      });
    } else if (action === 'login') {
      // For login, delete the OTP after verification
      await prisma.otpVerification.delete({
        where: { id: otpRecord.id },
      });

      // Verify user exists for login
      const user = await prisma.user.findUnique({
        where: { phone },
        select: {
          id: true,
          phone: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: "No account found. Please sign up first." },
          { status: 404 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          { error: "Account has been deactivated. Please contact support." },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "OTP verified successfully",
        action: 'login',
        user: user,
        verificationToken: otpRecord.id, // For creating session
      });
    } else {
      // Default: Just verify OTP (for password reset or other uses)
      // Delete OTP for non-signup actions
      await prisma.otpVerification.delete({
        where: { id: otpRecord.id },
      });
      
      return NextResponse.json({
        success: true,
        message: "OTP verified successfully",
        verificationToken: otpRecord.id,
      });
    }

  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
