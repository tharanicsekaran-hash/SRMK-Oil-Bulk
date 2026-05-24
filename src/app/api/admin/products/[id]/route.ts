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

async function isSlugTakenByOther(slug: string, excludeIds: string[]): Promise<boolean> {
  const found = await prisma.product.findFirst({
    where: {
      slug,
      NOT: { id: { in: excludeIds } },
    },
  });
  return Boolean(found);
}

// PUT update product (Admin only) — syncs units with per-unit prices
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = (await request.json()) as ProductPayload;
    const { id } = await params;

    const existing = await prisma.product.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

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

    const siblings = await prisma.product.findMany({
      where: { nameEn: existing.nameEn },
    });
    const siblingIds = siblings.map((s) => s.id);

    if (siblings.length > 0) {
      await prisma.$transaction(
        siblings.map((s) =>
          prisma.product.update({
            where: { id: s.id },
            data: { slug: `__pending__${s.id}` },
          })
        )
      );
    }

    const updatedIds: string[] = [];
    const pendingIds = [...siblingIds];

    for (let i = 0; i < unitVariants.length; i++) {
      const { unit, pricePaisa } = unitVariants[i];
      const slug = variantSlug(baseSlug, unit, i);
      const sku = variantSku(data.sku, unit, i);

      const match = siblings.find((s) => s.unit === unit);
      const excludeIds = pendingIds.filter((pid) => pid !== match?.id);

      if (await isSlugTakenByOther(slug, excludeIds)) {
        return NextResponse.json(
          { error: `Product with slug "${slug}" already exists` },
          { status: 409 }
        );
      }

      if (match) {
        await prisma.product.update({
          where: { id: match.id },
          data: { ...shared, slug, unit, sku, pricePaisa },
        });
        updatedIds.push(match.id);
      } else {
        const created = await prisma.product.create({
          data: { ...shared, slug, unit, sku, pricePaisa },
        });
        updatedIds.push(created.id);
        pendingIds.push(created.id);
      }
    }

    const toRemove = siblings.filter((s) => !updatedIds.includes(s.id));
    if (toRemove.length > 0) {
      await prisma.product.deleteMany({
        where: { id: { in: toRemove.map((s) => s.id) } },
      });
    }

    const primary =
      (await prisma.product.findUnique({ where: { id: updatedIds[0] } })) ??
      (await prisma.product.findUnique({ where: { id } }));

    return NextResponse.json(primary);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE product (Admin only) — ?allVariants=true removes all sizes with same name
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const allVariants = request.nextUrl.searchParams.get("allVariants") === "true";

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (allVariants) {
      await prisma.product.deleteMany({ where: { nameEn: existing.nameEn } });
    } else {
      await prisma.product.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
