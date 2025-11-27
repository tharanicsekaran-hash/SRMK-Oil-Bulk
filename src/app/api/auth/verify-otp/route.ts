import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

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
    // Don't delete yet - we need it for password reset
    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      verificationToken: otpRecord.id, // Use this for password reset
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}

