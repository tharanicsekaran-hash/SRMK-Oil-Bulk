import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all products (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create new product (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.nameTa || !data.nameEn || !data.slug || !data.pricePaisa || !data.unit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if slug already exists
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json({ error: "Product with this slug already exists" }, { status: 409 });
    }

    const product = await prisma.product.create({
      data: {
        nameTa: data.nameTa,
        nameEn: data.nameEn,
        slug: data.slug,
        descriptionTa: data.descriptionTa || null,
        descriptionEn: data.descriptionEn || null,
        imageUrl: data.imageUrl || null,
        pricePaisa: data.pricePaisa,
        unit: data.unit,
        inStock: data.inStock ?? true,
        stockQuantity: data.stockQuantity || 0,
        discount: data.discount || 0,
        offerTextTa: data.offerTextTa || null,
        offerTextEn: data.offerTextEn || null,
        category: data.category || null,
        sku: data.sku || null,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
