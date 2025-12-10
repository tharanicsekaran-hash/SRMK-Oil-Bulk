import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT update product (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { id } = params;

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // If slug is being changed, check if new slug is available
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "Product with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const product = await prisma.product.update({
      where: { id },
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

    return NextResponse.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE product (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
