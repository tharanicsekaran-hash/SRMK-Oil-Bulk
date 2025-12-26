"use client";
import Link from "next/link";
import { useI18n } from "@/components/LanguageProvider";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/animations";
import MotionInView from "@/components/MotionInView";
import { ShieldCheck, Award, Truck, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";

type Product = {
  id: string;
  slug: string;
  nameTa: string;
  nameEn: string;
  taglineTa?: string;
  taglineEn?: string;
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

export default function Home() {
  const { t } = useI18n();
  const [heroOk, setHeroOk] = useState(true);
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

  // Group products by name for display
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
  return (
    <>
      <section className="relative h-[420px] md:h-[520px] overflow-hidden">
        {heroOk ? (
          <Image
            src="/images/hero.jpg"
            alt="SRMK Oils"
            fill
            priority
            className="object-cover"
            style={{ objectPosition: "right center" }}
            onError={() => setHeroOk(false)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-gray-200 to-amber-100" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/25 to-black/0" />
        <div className="relative z-10 h-full">
          <div className="max-w-6xl mx-auto h-full px-4 flex items-center">
            <MotionInView className="space-y-4 text-white" variants={stagger()}>
              <motion.h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" variants={fadeUp}>{t.home.heroTitle}</motion.h1>
              <motion.p className="text-lg text-white/90 max-w-2xl" variants={fadeUp}>{t.home.heroSubtitle}</motion.p>
              <motion.div className="flex gap-3" variants={fadeUp}>
                <Link href="/products" className="px-5 py-3 rounded-md bg-[#d97706] text-white hover:bg-[#b76405] font-semibold">
                  {t.home.shopNow}
                </Link>
              </motion.div>
            </MotionInView>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <MotionInView variants={stagger()}>
            <motion.h2 className="text-2xl font-bold mb-6 text-[#d97706]" variants={fadeUp}>{t.home.featuredTitle}</motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {groupedProducts.slice(0, 3).map((variants) => (
                <ProductCard key={variants[0].id} variants={variants} />
              ))}
            </div>
            <motion.div className="text-center mt-8" variants={fadeUp}>
              <Link href="/products" className="inline-block px-5 py-2.5 rounded-md bg-[#d97706] text-white hover:bg-[#b76405] transition-colors font-semibold">
                {t.home.viewAll}
              </Link>
            </motion.div>
          </MotionInView>
        </div>
      </section>

      <section className="py-12 bg-white border-t">
        <div className="max-w-6xl mx-auto px-4">
          <MotionInView variants={stagger()}>
            <motion.h2 className="text-3xl font-extrabold text-center mb-10 text-[#d97706]" variants={fadeUp}>{t.home.why.title}</motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { icon: ShieldCheck, item: t.home.why.pure },
                { icon: Award, item: t.home.why.quality },
                { icon: Truck, item: t.home.why.delivery },
                { icon: ShoppingBag, item: t.home.why.ordering },
              ].map(({ icon: Icon, item }, idx) => (
                <motion.div key={idx} className="p-5 rounded-lg transition-transform hover:scale-[1.02] bg-amber-50/40" variants={fadeUp}>
                  <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-orange-50 text-[#d97706] flex items-center justify-center ring-1 ring-orange-100">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-sm text-gray-600">{item.subtitle}</div>
                </motion.div>
              ))}
            </div>
          </MotionInView>
        </div>
      </section>

      <section className="py-16 bg-[#d97706] text-white">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-5">
          <MotionInView variants={stagger()}>
            <motion.h3 className="text-3xl font-extrabold" variants={fadeUp}>{t.home.cta.title}</motion.h3>
            <motion.p className="text-white/90 text-lg" variants={fadeUp}>{t.home.cta.subtitle}</motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/products" className="inline-block px-5 py-3 rounded-md bg-white text-[#b76405] hover:bg-gray-100 transition-colors font-semibold">{t.home.cta.button}</Link>
            </motion.div>
          </MotionInView>
        </div>
      </section>
    </>
  );
}
