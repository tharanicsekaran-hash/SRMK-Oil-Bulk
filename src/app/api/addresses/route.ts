import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch user's addresses
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Fetch addresses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

// POST - Create new address
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { label, line1, line2, city, state, postalCode, lat, lng } =
      await request.json();

    if (!line1 || !city || !postalCode) {
      return NextResponse.json(
        { error: "Address line, city, and postal code are required" },
        { status: 400 }
      );
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        label,
        line1,
        line2,
        city,
        state: state || "",
        postalCode,
        lat,
        lng,
      },
    });

    return NextResponse.json({ success: true, address });
  } catch (error) {
    console.error("Create address error:", error);
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    );
  }
}

