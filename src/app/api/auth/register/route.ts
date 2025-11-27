import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const { phone, password, name } = await request.json();

    // Validate inputs
    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone and password are required" },
        { status: 400 }
      );
    }

    // Validate phone format (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: "Phone must be 10 digits" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Phone number already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        phone,
        passwordHash,
        name: name || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}

