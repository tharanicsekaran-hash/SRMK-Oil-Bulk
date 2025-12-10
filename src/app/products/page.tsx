"use client";
import ProductCard from "@/components/ProductCard";
import { useI18n } from "@/components/LanguageProvider";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/animations";
import { useMemo, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

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
  offerTextTa?: string;
  offerTextEn?: string;
  category?: string;
  sku?: string;
  isActive: boolean;
};

export default function ProductsPage() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [unit, setUnit] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  // Group products by name (e.g., all sizes of "Coconut Oil" together)
  const groupedProducts = useMemo(() => {
    const groups = new Map<string, Product[]>();
    
    products.forEach((p) => {
      const key = p.nameEn; // Group by English name
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(p);
    });

    // Sort variants by unit within each group
    groups.forEach((variants) => {
      variants.sort((a, b) => {
        const order = { "500ml": 1, "1L": 2, "2L": 3 };
        return (order[a.unit as keyof typeof order] || 99) - (order[b.unit as keyof typeof order] || 99);
      });
    });

    return Array.from(groups.values());
  }, [products]);

  const units = useMemo(() => {
    const u = new Set<string>();
    products.forEach((p) => {
      if (p.unit) u.add(p.unit);
    });
    return Array.from(u).sort();
  }, [products]);

  const filtered = groupedProducts.filter((variants) => {
    const p = variants[0]; // Use first variant for filtering
    const name = `${p.nameTa} ${p.nameEn}`.toLowerCase();
    if (q && !name.includes(q.toLowerCase())) return false;
    if (unit !== "all" && !variants.some(v => v.unit === unit)) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#d97706]" />
      </div>
    );
  }

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
        {filtered.map((variants) => (
          <motion.div key={variants[0].id} variants={fadeUp}>
            <ProductCard variants={variants} />
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No products found</p>
        </div>
      )}
    </div>
  );
}
