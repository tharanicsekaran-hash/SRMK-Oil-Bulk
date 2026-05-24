import { Prisma } from "@prisma/client";
import { parseUnitList, unitToSlugSuffix } from "@/lib/admin-product-form";

export type UnitVariantInput = {
  unit: string;
  pricePaisa: number;
};

export type ProductPayload = {
  nameTa: string;
  nameEn: string;
  slug: string;
  taglineTa?: string;
  taglineEn?: string;
  descriptionTa?: string;
  descriptionEn?: string;
  imageUrl?: string;
  pricePaisa?: number;
  unit: string;
  unitVariants?: UnitVariantInput[];
  inStock?: boolean;
  stockQuantity?: number;
  discount?: number;
  offerTextTa?: string;
  offerTextEn?: string;
  category?: string;
  sku?: string;
  isActive?: boolean;
};

export function sharedProductFields(
  data: ProductPayload
): Omit<Prisma.ProductCreateInput, "slug" | "unit" | "sku" | "pricePaisa"> & {
  sku?: string | null;
} {
  return {
    nameTa: data.nameTa,
    nameEn: data.nameEn,
    taglineTa: data.taglineTa || null,
    taglineEn: data.taglineEn || null,
    descriptionTa: data.descriptionTa || null,
    descriptionEn: data.descriptionEn || null,
    imageUrl: data.imageUrl || null,
    inStock: data.inStock ?? true,
    stockQuantity: data.stockQuantity ?? 0,
    discount: data.discount ?? 0,
    offerTextTa: data.offerTextTa || null,
    offerTextEn: data.offerTextEn || null,
    category: data.category || null,
    sku: data.sku || null,
    isActive: data.isActive ?? true,
  };
}

/** Resolved unit + price rows for create/update */
export function resolveUnitVariants(data: ProductPayload): UnitVariantInput[] {
  if (data.unitVariants?.length) {
    return data.unitVariants;
  }
  const units = getUnitsFromPayload(data);
  const fallbackPrice = data.pricePaisa ?? 0;
  return units.map((unit) => ({ unit, pricePaisa: fallbackPrice }));
}

export function variantSlug(baseSlug: string, unit: string, index: number): string {
  const suffix = unitToSlugSuffix(unit);
  if (index === 0) return baseSlug;
  return suffix ? `${baseSlug}-${suffix}` : `${baseSlug}-${index}`;
}

export function variantSku(baseSku: string | null | undefined, unit: string, index: number): string | null {
  if (!baseSku) return null;
  const suffix = unitToSlugSuffix(unit);
  if (index === 0) return baseSku;
  return suffix ? `${baseSku}-${suffix}` : `${baseSku}-${index}`;
}

export function getUnitsFromPayload(data: ProductPayload): string[] {
  const units = parseUnitList(data.unit);
  return units.length > 0 ? units : [data.unit.trim()].filter(Boolean);
}
