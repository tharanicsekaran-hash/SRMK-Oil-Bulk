"use client";
import { useParams, useRouter } from "next/navigation";
import { sampleProducts, formatPricePaisa, type Product } from "@/lib/products";
import { useI18n } from "@/components/LanguageProvider";
import { useCart } from "@/store/cart";
import Image from "next/image";
import { useMemo, useState } from "react";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { locale, t } = useI18n();
  const add = useCart((s) => s.add);

  const p = sampleProducts.find((p) => p.slug === params.slug);
  if (!p)
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <p>Not found</p>
      </div>
    );

  const name = locale === "ta" ? p.nameTa : p.nameEn;
  const desc = locale === "ta" ? p.descriptionTa : p.descriptionEn;
  const variants = useMemo(() => p.variants ?? [{ unit: p.unit, pricePaisa: p.pricePaisa }], [p]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const active = variants[activeIdx];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-2">
      <div className="p-4 rounded-xl bg-white border shadow-sm">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gradient-to-br from-amber-50 to-amber-100">
          {p.imageUrl && (
            <Image src={p.imageUrl} alt={name} fill className="object-contain" sizes="(max-width: 768px) 100vw, 50vw" />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{name}</h1>
          <div className="mt-1 text-sm text-gray-600">
            {p.inStock ? t.product.inStock : t.product.outOfStock}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-600 mb-1">{t.product.size}:</div>
          <div className="flex flex-wrap gap-2">
            {variants.map((v, i) => (
              <button
                key={v.unit}
                className={`px-3 py-1.5 text-xs rounded border ${i === activeIdx ? "bg-orange-50 border-orange-400" : "hover:bg-gray-50"}`}
                onClick={() => setActiveIdx(i)}
              >
                {v.unit}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-600 mb-1">{t.product.quantity}:</div>
          <div className="flex items-center gap-3">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 rounded-full border text-lg leading-none">−</button>
            <span className="w-8 text-center">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="w-9 h-9 rounded-full border text-lg leading-none">＋</button>
          </div>
        </div>

        <div className="text-2xl font-semibold text-[#d97706]">{formatPricePaisa(active.pricePaisa, locale)}</div>

        {desc && <p className="text-sm text-gray-700 leading-6">{desc}</p>}

        <div className="flex gap-3 pt-2">
          <button
            className="px-5 py-2.5 rounded bg-[#d97706] text-white hover:bg-[#b76405]"
            onClick={() => add(p as Product, qty, name, { pricePaisa: active.pricePaisa, unit: active.unit })}
          >
            {t.actions.addToCart}
          </button>
          <button
            className="px-5 py-2.5 rounded border hover:bg-gray-50"
            onClick={() => {
              add(p as Product, qty, name, { pricePaisa: active.pricePaisa, unit: active.unit });
              router.push("/checkout");
            }}
          >
            {t.actions.buyNow}
          </button>
        </div>
      </div>
    </div>
  );
}
