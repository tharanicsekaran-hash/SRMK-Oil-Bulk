import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ProductPayload,
  resolveUnitVariants,
  sharedProductFields,
  variantSku,
  variantSlug,
} from "@/lib/admin-product-variants";

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

// POST create new product (Admin only) — supports comma-separated units + per-unit prices
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = (await request.json()) as ProductPayload;

    if (!data.nameTa || !data.nameEn || !data.slug || !data.unit?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const unitVariants = resolveUnitVariants(data);
    if (unitVariants.length === 0) {
      return NextResponse.json({ error: "At least one unit is required" }, { status: 400 });
    }
    if (unitVariants.some((v) => !v.pricePaisa || v.pricePaisa <= 0)) {
      return NextResponse.json({ error: "Each unit must have a valid price" }, { status: 400 });
    }

    const shared = sharedProductFields(data);
    const baseSlug = data.slug.trim();

    const slugsToCreate = unitVariants.map((variant, i) => ({
      ...variant,
      slug: variantSlug(baseSlug, variant.unit, i),
      sku: variantSku(data.sku, variant.unit, i),
    }));

    for (const { slug } of slugsToCreate) {
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json(
          { error: `Product with slug "${slug}" already exists` },
          { status: 409 }
        );
      }
    }

    const created = await prisma.$transaction(
      slugsToCreate.map(({ unit, slug, sku, pricePaisa }) =>
        prisma.product.create({
          data: {
            ...shared,
            slug,
            unit,
            sku,
            pricePaisa,
          },
        })
      )
    );

    return NextResponse.json(created.length === 1 ? created[0] : created, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
