import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    // Validate phone
    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: "Valid 10-digit phone number required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this phone number" },
        { status: 404 }
      );
    }

    // Check for recent OTP (rate limiting - 1 OTP per minute)
    const recentOtp = await prisma.otpVerification.findFirst({
      where: {
        phone,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000), // Last 1 minute
        },
      },
    });

    if (recentOtp) {
      return NextResponse.json(
        { error: "Please wait 1 minute before requesting another OTP" },
        { status: 429 }
      );
    }

    // Delete old OTPs for this phone
    await prisma.otpVerification.deleteMany({
      where: { phone },
    });

    // Mock OTP - always "123456" for development
    const otp = "123456";
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to database
    await prisma.otpVerification.create({
      data: {
        phone,
        otp,
        expiresAt,
        attempts: 0,
      },
    });

    // In production, you would send SMS here
    // For now, just log it
    console.log(`Mock OTP for ${phone}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully (Mock: 123456)",
      expiresIn: 300, // 5 minutes in seconds
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}

