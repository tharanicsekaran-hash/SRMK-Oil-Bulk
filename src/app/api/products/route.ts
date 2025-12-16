import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all active products (public endpoint - no auth required)
export async function GET() {
  try {
    console.log("📦 Fetching products from database...");
    console.log("📊 Database URL configured:", !!process.env.DATABASE_URL);
    
    const products = await prisma.product.findMany({
      where: {
        isActive: true, // Only show active products to customers
      },
      orderBy: [
        { nameEn: "asc" },
        { unit: "asc" },
      ],
    });

    console.log(`✅ Found ${products.length} active products`);
    return NextResponse.json(products);
  } catch (error) {
    console.error("❌ Get products error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}

