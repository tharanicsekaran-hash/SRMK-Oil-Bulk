"use client";
import Link from "next/link";
import { useI18n } from "@/components/LanguageProvider";
import ProductCard from "@/components/ProductCard";
import { sampleProducts } from "@/lib/products";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/animations";
import MotionInView from "@/components/MotionInView";
import { ShieldCheck, Award, Truck, ShoppingBag } from "lucide-react";

export default function Home() {
  const { t } = useI18n();
  return (
    <>
      <section className="bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-14 grid gap-6 md:grid-cols-2 items-center">
          <MotionInView className="space-y-4" variants={stagger()}>
            <motion.h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" variants={fadeUp}>{t.home.heroTitle}</motion.h1>
            <motion.p className="text-lg text-gray-700" variants={fadeUp}>{t.home.heroSubtitle}</motion.p>
            <motion.div className="flex gap-3" variants={fadeUp}>
              <Link href="/products" className="px-5 py-3 rounded-md bg-[#d97706] text-white hover:bg-[#b76405] font-semibold">
                {t.home.shopNow}
              </Link>
            </motion.div>
          </MotionInView>
          <MotionInView variants={fadeUp}>
            <div className="aspect-video rounded bg-amber-100" />
          </MotionInView>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <MotionInView variants={stagger()}>
            <motion.h2 className="text-2xl font-bold mb-6 text-[#d97706]" variants={fadeUp}>{t.home.featuredTitle}</motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sampleProducts.map((p) => (
                <ProductCard key={p.id} p={p} />
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
