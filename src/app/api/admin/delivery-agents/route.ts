import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// GET all delivery agents (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agents = await prisma.user.findMany({
      where: { role: "DELIVERY" },
      select: {
        id: true,
        name: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error("GET delivery agents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery agents" },
      { status: 500 }
    );
  }
}

// POST create delivery agent (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, password } = await request.json();

    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: "Name, phone, and password are required" },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const existing = await prisma.user.findUnique({
      where: { phone },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User with this phone number already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const agent = await prisma.user.create({
      data: {
        name,
        phone,
        passwordHash,
        role: "DELIVERY",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error("POST delivery agent error:", error);
    return NextResponse.json(
      { error: "Failed to create delivery agent" },
      { status: 500 }
    );
  }
}
