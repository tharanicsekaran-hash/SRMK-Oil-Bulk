import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const { name, phone, password, role } = await request.json();

    // Validate input
    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone and password are required" },
        { status: 400 }
      );
    }

    // Only allow ADMIN or DELIVERY roles
    if (role !== "ADMIN" && role !== "DELIVERY") {
      return NextResponse.json(
        { error: "Invalid role. Only ADMIN or DELIVERY roles are allowed." },
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

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with specified role
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        passwordHash,
        role,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${role} account created successfully`,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}

