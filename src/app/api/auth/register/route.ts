import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const { name, phone, password, otp } = await request.json();

    // Validate phone
    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate phone format (should be 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Phone number must be 10 digits" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this phone number already exists" },
        { status: 409 }
      );
    }

    // OTP-based registration (Primary method)
    if (otp) {
      // Verify OTP first
      const otpRecord = await prisma.otpVerification.findFirst({
        where: { phone },
        orderBy: { createdAt: "desc" },
      });

      if (!otpRecord) {
        return NextResponse.json(
          { error: "Invalid OTP. Please request a new one." },
          { status: 400 }
        );
      }

      // Check if OTP expired
      if (otpRecord.expiresAt < new Date()) {
        await prisma.otpVerification.delete({ where: { id: otpRecord.id } });
        return NextResponse.json(
          { error: "OTP expired. Please request a new one." },
          { status: 400 }
        );
      }

      // Verify OTP
      if (otpRecord.otp !== otp) {
        return NextResponse.json(
          { error: "Invalid OTP" },
          { status: 400 }
        );
      }

      // Delete OTP record
      await prisma.otpVerification.delete({ where: { id: otpRecord.id } });

      // Create user without password (OTP-based account)
      const user = await prisma.user.create({
        data: {
          name: name || null,
          phone,
          passwordHash: null, // Passwordless
          role: "CUSTOMER",
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Account created successfully with OTP verification",
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
      });
    }

    // Password-based registration (Fallback for admin/delivery users)
    if (password) {
      // Validate password length
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user with password
      const user = await prisma.user.create({
        data: {
          name: name || null,
          phone,
          passwordHash,
          role: "CUSTOMER",
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Account created successfully",
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
      });
    }

    return NextResponse.json(
      { error: "Either OTP or password is required for registration" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
