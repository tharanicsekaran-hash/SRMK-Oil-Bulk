/** Digits-only string for admin numeric fields */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Parse comma-separated unit labels (e.g. "500ml, 1L, 2L") */
export function parseUnitList(unit: string): string[] {
  return unit
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
}

/** Slug suffix for a unit variant */
export function unitToSlugSuffix(unit: string): string {
  return unit
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Rupees display from paisa — empty when 0, no decimal suffix */
export function paisaToRupeeInput(paisa: number): string {
  if (!paisa) return "";
  const rupees = paisa / 100;
  return Number.isInteger(rupees) ? String(rupees) : String(rupees);
}

/** Integer display — empty when 0 */
export function intToInput(n: number): string {
  if (!n) return "";
  return String(n);
}

export function rupeeInputToPaisa(input: string): number {
  const digits = digitsOnly(input);
  if (!digits) return 0;
  return parseInt(digits, 10) * 100;
}

export function inputToInt(input: string): number {
  const digits = digitsOnly(input);
  if (!digits) return 0;
  return parseInt(digits, 10);
}

/** Format price for admin list (no trailing .00) */
export function formatAdminPrice(paisa: number): string {
  const rupees = paisa / 100;
  if (Number.isInteger(rupees)) return `₹${rupees}`;
  return `₹${rupees}`;
}

/** Base slug shared by variant rows (e.g. coconut-oil vs coconut-oil-500ml) */
export function getBaseSlugFromSiblings(siblings: { slug: string }[]): string {
  if (siblings.length === 0) return "";
  if (siblings.length === 1) return siblings[0].slug;
  const slugs = siblings.map((s) => s.slug).sort((a, b) => a.length - b.length);
  for (const slug of slugs) {
    if (slugs.every((s) => s === slug || s.startsWith(`${slug}-`))) {
      return slug;
    }
  }
  return slugs[0];
}
