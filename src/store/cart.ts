"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/products";

export type CartItem = {
  id: string; // product id
  slug: string;
  name: string; // localized at add time
  pricePaisa: number;
  unit: string;
  qty: number;
  imageUrl?: string;
};

type CartState = {
  items: CartItem[];
  add: (p: Product, qty?: number, name?: string, override?: { pricePaisa: number; unit: string }) => void;
  remove: (id: string, unit?: string) => void;
  clear: () => void;
  setQty: (id: string, qty: number, unit?: string) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (p, qty = 1, name, override) => {
        const items = [...get().items];
        const keyUnit = override?.unit ?? p.unit;
        const idx = items.findIndex((i) => i.id === p.id && i.unit === keyUnit);
        if (idx >= 0) {
          items[idx].qty += qty;
        } else {
          items.push({
            id: p.id,
            slug: p.slug,
            name: name ?? p.nameTa,
            pricePaisa: override?.pricePaisa ?? p.pricePaisa,
            unit: keyUnit,
            qty,
            imageUrl: p.imageUrl,
          });
        }
        set({ items });
      },
      remove: (id, unit) => set({ items: get().items.filter((i) => !(i.id === id && (unit ? i.unit === unit : true))) }),
      clear: () => set({ items: [] }),
      setQty: (id, qty, unit) =>
        set({
          items: get().items.map((i) => (i.id === id && (unit ? i.unit === unit : true) ? { ...i, qty } : i)),
        }),
    }),
    { name: "tamil-oils-cart" }
  )
);
