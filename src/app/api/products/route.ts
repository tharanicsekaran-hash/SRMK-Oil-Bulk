import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all active products (public endpoint - no auth required)
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true, // Only show active products to customers
      },
      orderBy: [
        { nameEn: "asc" },
        { unit: "asc" },
      ],
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

