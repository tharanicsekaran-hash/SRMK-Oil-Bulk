export type PricedLine = {
  pricePaisa: number;
  qty: number;
  discount?: number;
};

export function lineSubtotalPaisa(item: PricedLine): number {
  return item.pricePaisa * item.qty;
}

export function lineDiscountPaisa(item: PricedLine): number {
  const pct = item.discount ?? 0;
  if (pct <= 0) return 0;
  return Math.round((item.pricePaisa * item.qty * pct) / 100);
}

export function lineTotalPaisa(item: PricedLine): number {
  return lineSubtotalPaisa(item) - lineDiscountPaisa(item);
}

export function unitPriceAfterDiscountPaisa(pricePaisa: number, discount = 0): number {
  if (discount <= 0) return pricePaisa;
  return Math.round((pricePaisa * (100 - discount)) / 100);
}

export function cartTotals(items: PricedLine[], deliveryChargePaisa = 0) {
  const subtotalPaisa = items.reduce((sum, i) => sum + lineSubtotalPaisa(i), 0);
  const discountPaisa = items.reduce((sum, i) => sum + lineDiscountPaisa(i), 0);
  const totalPaisa = subtotalPaisa - discountPaisa + deliveryChargePaisa;
  return { subtotalPaisa, discountPaisa, totalPaisa };
}
