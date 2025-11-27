import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const { phone, newPassword, verificationToken } = await request.json();

    // Validate inputs
    if (!phone || !newPassword || !verificationToken) {
      return NextResponse.json(
        { error: "Phone, new password, and verification token are required" },
        { status: 400 }
      );
    }

    // Validate password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Verify the OTP record exists and matches
    const otpRecord = await prisma.otpVerification.findUnique({
      where: { id: verificationToken },
    });

    if (!otpRecord || otpRecord.phone !== phone) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    // Check if OTP is still valid (within expiry time)
    if (otpRecord.expiresAt < new Date()) {
      await prisma.otpVerification.delete({
        where: { id: otpRecord.id },
      });
      return NextResponse.json(
        { error: "Verification expired. Please start over." },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Delete OTP record
    await prisma.otpVerification.delete({
      where: { id: otpRecord.id },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}

