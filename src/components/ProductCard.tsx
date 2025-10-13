"use client";
import Link from "next/link";
import Image from "next/image";
import { formatPricePaisa, type Product } from "@/lib/products";
import { useI18n } from "@/components/LanguageProvider";
import { useCart } from "@/store/cart";
import { useMemo, useState } from "react";
import { useToast } from "@/store/toast";

export default function ProductCard({ p }: { p: Product }) {
  const { locale, t } = useI18n();
  const add = useCart((s) => s.add);
  const name = locale === "ta" ? p.nameTa : p.nameEn;

  const variants = useMemo(() => p.variants ?? [{ unit: p.unit, pricePaisa: p.pricePaisa }], [p]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const active = variants[activeIdx];
  const showToast = useToast((s) => s.show);

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => q + 1);

  return (
    <div className="group h-full flex flex-col rounded-xl border shadow-sm overflow-hidden bg-white transition hover:shadow-md hover:-translate-y-0.5">
      <div className="p-4">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-amber-100">
          {p.imageUrl && (
            <Image
              src={p.imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
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
            {variants.map((v, i) => (
              <button
                key={v.unit}
                type="button"
                className={`px-2 py-1 text-xs rounded border ${i === activeIdx ? "bg-orange-50 border-orange-400" : "hover:bg-gray-50"}`}
                onClick={() => setActiveIdx(i)}
              >
                {v.unit}
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
          <div className="text-xl font-semibold text-[#d97706]">{formatPricePaisa(active.pricePaisa, locale)}</div>
          <div className="mt-2 flex items-center gap-2">
            <Link href={`/products/${p.slug}`} className="px-3 py-2 text-sm rounded border hover:bg-gray-50">
              {t.product.details}
            </Link>
            <button
              className="px-3.5 py-2.5 text-sm whitespace-nowrap rounded bg-[#d97706] text-white hover:bg-[#b76405] flex-1 text-center min-w-0"
              onClick={() => {
                add(p, qty, name, { pricePaisa: active.pricePaisa, unit: active.unit });
                showToast(`${name} (${active.unit}) added to cart`);
              }}
            >
              {t.actions.addToCart}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
