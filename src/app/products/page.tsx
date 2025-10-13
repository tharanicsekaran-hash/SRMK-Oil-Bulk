"use client";
import ProductCard from "@/components/ProductCard";
import { sampleProducts } from "@/lib/products";
import { useI18n } from "@/components/LanguageProvider";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/animations";
import { useMemo, useState } from "react";

export default function ProductsPage() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [unit, setUnit] = useState<string>("all");
  

  const units = useMemo(() => {
    const u = new Set<string>();
    sampleProducts.forEach((p) => {
      if (p.unit) u.add(p.unit);
      p.variants?.forEach((v) => u.add(v.unit));
    });
    return Array.from(u);
  }, []);

  const filtered = sampleProducts.filter((p) => {
    const name = `${p.nameTa} ${p.nameEn}`.toLowerCase();
    if (q && !name.includes(q.toLowerCase())) return false;
    if (unit !== "all") {
      const match = p.unit === unit || p.variants?.some((v) => v.unit === unit);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <motion.h1 className="text-2xl font-bold mb-4 text-[#d97706]" variants={fadeUp} initial="hidden" animate="show">{t.nav.products}</motion.h1>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products..."
          className="border rounded px-3 py-2"
        />
        <select value={unit} onChange={(e) => setUnit(e.target.value)} className="border rounded px-3 py-2">
          <option value="all">All sizes</option>
          {units.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        
        
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={stagger(0.06)}
        initial="hidden"
        animate="show"
      >
        {filtered.map((p) => (
          <motion.div key={p.id} variants={fadeUp}>
            <ProductCard p={p} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
