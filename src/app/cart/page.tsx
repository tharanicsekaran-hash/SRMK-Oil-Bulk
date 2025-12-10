"use client";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { useI18n } from "@/components/LanguageProvider";
import { formatPricePaisa } from "@/lib/products";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { useState, useEffect, useMemo } from "react";

type Product = {
  id: string;
  slug: string;
  nameTa: string;
  nameEn: string;
  descriptionTa?: string;
  descriptionEn?: string;
  imageUrl?: string;
  pricePaisa: number;
  unit: string;
  inStock: boolean;
  stockQuantity: number;
  discount: number;
  category?: string;
};

export default function CartPage() {
  const { t, locale } = useI18n();
  const { items, remove, setQty } = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  // Group products by name
  const groupedProducts = useMemo(() => {
    const groups = new Map<string, Product[]>();
    
    products.forEach((p) => {
      const key = p.nameEn;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(p);
    });

    groups.forEach((variants) => {
      variants.sort((a, b) => {
        const order = { "500ml": 1, "1L": 2, "2L": 3 };
        return (order[a.unit as keyof typeof order] || 99) - (order[b.unit as keyof typeof order] || 99);
      });
    });

    return Array.from(groups.values());
  }, [products]);

  const subtotal = items.reduce((sum, i) => sum + i.pricePaisa * i.qty, 0);
  const deliveryChargePaisa = subtotal < 50000 ? 5000 : 0;
  const totalPaisa = subtotal + deliveryChargePaisa;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-semibold mb-4">{t.cart.title}</h1>
      {items.length === 0 ? (
        <div className="py-10">
          <div className="mx-auto max-w-xl text-center rounded-lg border bg-white/70 backdrop-blur p-8">
            <div className="text-5xl mb-3">🛒</div>
            <h2 className="text-xl font-semibold mb-2">{t.cart.title}</h2>
            <p className="text-gray-600 mb-5">{t.cart.empty}</p>
            <Link href="/products" className="inline-block px-5 py-2.5 rounded-md bg-[#d97706] text-white hover:bg-[#b76405] font-semibold">
              {t.home.shopNow}
            </Link>
          </div>
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-4 text-[#d97706]">Popular Picks</h3>
            <div className="grid auto-rows-fr items-stretch grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedProducts.slice(0, 3).map((variants) => (
                <div key={variants[0].id} className="h-full">
                  <ProductCard variants={variants} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((i) => {
            const p = products.find((sp) => sp.id === i.id || sp.slug === i.slug);
            const imageSrc = i.imageUrl || p?.imageUrl || "/images/groundnut.jpg";
            return (
            <div key={`${i.id}-${i.unit}`} className="flex items-center justify-between border rounded p-3">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-md bg-amber-50">
                  <Image src={imageSrc} alt={i.name} fill className="object-cover" />
                </div>
                <div className="flex flex-col">
                  <div className="font-medium">{i.name}</div>
                  <div className="text-sm text-gray-600">{i.unit} · {formatPricePaisa(i.pricePaisa, locale)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={i.qty}
                  onChange={(e) => setQty(i.id, Math.max(1, Number(e.target.value)), i.unit)}
                  className="w-16 border rounded px-2 py-1"
                />
                <button className="text-red-600" onClick={() => remove(i.id, i.unit)}>×</button>
              </div>
            </div>
            );
          })}
          <div className="space-y-1 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">{t.cart.subtotal}</div>
              <div className="text-base font-medium">{formatPricePaisa(subtotal, locale)}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Delivery</div>
              <div className="text-base font-medium">{formatPricePaisa(deliveryChargePaisa, locale)}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-lg font-semibold">{formatPricePaisa(totalPaisa, locale)}</div>
            </div>
          </div>
          <div className="hidden md:flex gap-3">
            <Link href="/products" className="px-4 py-2 rounded border border-[#d6d3d1] hover:bg-[#fff7e6]">
              Continue shopping
            </Link>
            <Link href="/checkout" className="px-4 py-2 rounded bg-[#d97706] text-white hover:bg-[#b76405]">
              {t.cart.checkout}
            </Link>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="md:hidden fixed inset-x-0 bottom-0 border-t bg-white px-4 py-3 shadow">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] text-gray-600">Subtotal: {formatPricePaisa(subtotal, locale)}</div>
              <div className="text-[10px] text-gray-600">Delivery: {formatPricePaisa(deliveryChargePaisa, locale)}</div>
              <div className="text-base font-semibold">Total: {formatPricePaisa(totalPaisa, locale)}</div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/products" className="px-3 py-2 rounded border border-[#d6d3d1] text-sm">
                Shop
              </Link>
              <Link href="/checkout" className="px-4 py-2 rounded bg-[#d97706] text-white hover:bg-[#b76405]">
                {t.cart.checkout}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
