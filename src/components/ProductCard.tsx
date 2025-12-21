"use client";
import Link from "next/link";
import Image from "next/image";
import { formatPricePaisa } from "@/lib/products";
import { useI18n } from "@/components/LanguageProvider";
import { useCart } from "@/store/cart";
import { useState } from "react";
import { useToast } from "@/store/toast";

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
  discount?: number;
  offerTextTa?: string;
  offerTextEn?: string;
};

export default function ProductCard({ variants }: { variants: Product[] }) {
  const { locale, t } = useI18n();
  const add = useCart((s) => s.add);
  const [activeIdx, setActiveIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const showToast = useToast((s) => s.show);

  const p = variants[activeIdx]; // Currently selected variant
  const name = locale === "ta" ? p.nameTa : p.nameEn;

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => q + 1);

  return (
    <div className="group h-full flex flex-col rounded-xl border shadow-sm overflow-hidden bg-white transition hover:shadow-md hover:-translate-y-0.5">
      <div className="p-4">
        <div className="relative aspect-[3/4] md:aspect-[4/5] w-full overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-amber-100">
          {p.imageUrl && (
            <Image
              src={p.imageUrl}
              alt={name}
              fill
              className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.01]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          )}
        </div>
      </div>
      <div className="px-4 pb-4 flex flex-col gap-2.5 flex-1">
        <div>
          <h3 className="text-base md:text-lg font-semibold leading-snug">{name}</h3>
          {p.descriptionEn && (
            <p className="text-[13px] md:text-sm text-gray-600 mt-1 leading-relaxed">{locale === "ta" ? p.descriptionTa : p.descriptionEn}</p>
          )}
        </div>

        <div className="space-y-1">
          <div className="text-xs text-gray-600">{t.product.size}:</div>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant, i) => (
              <button
                key={variant.id}
                type="button"
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                  i === activeIdx
                    ? "bg-orange-50 border-orange-400 text-orange-700 font-medium"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setActiveIdx(i)}
              >
                {variant.unit}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-gray-600">{t.product.quantity}:</div>
          <div className="flex items-center gap-3">
            <button onClick={dec} className="w-8 h-8 rounded-full border text-lg leading-none">−</button>
            <span className="w-7 text-center text-sm">{qty}</span>
            <button onClick={inc} className="w-8 h-8 rounded-full border text-lg leading-none">＋</button>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-semibold text-[#d97706]">
              {formatPricePaisa(p.pricePaisa, locale)}
            </div>
            {p.discount != null && p.discount > 0 && (
              <span className="text-xs text-green-600 font-medium">
                {p.discount}% OFF
              </span>
            )}
          </div>
          {(p.offerTextEn || p.offerTextTa) && (
            <p className="text-xs text-green-600 mt-1">
              {locale === "ta" ? (p.offerTextTa || p.offerTextEn) : (p.offerTextEn || p.offerTextTa)}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <Link href={`/products/${p.slug}`} className="px-3 py-2 text-sm rounded border hover:bg-gray-50">
              {t.product.details}
            </Link>
            <button
              className="px-3.5 py-2.5 text-sm whitespace-nowrap rounded bg-[#d97706] text-white hover:bg-[#b76405] flex-1 text-center min-w-0 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!p.inStock}
              onClick={() => {
                add(p, qty, name, { pricePaisa: p.pricePaisa, unit: p.unit });
                showToast(`${name} (${p.unit}) added to cart`);
              }}
            >
              {p.inStock ? t.actions.addToCart : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
