"use client";
import { useParams, useRouter } from "next/navigation";
import { formatPricePaisa } from "@/lib/products";
import { useI18n } from "@/components/LanguageProvider";
import { useCart } from "@/store/cart";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Loader2, ShoppingCart, Zap } from "lucide-react";
import { useToast } from "@/store/toast";
import Link from "next/link";

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
  offerTextTa?: string;
  offerTextEn?: string;
  category?: string;
  sku?: string;
  isActive: boolean;
};

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { locale, t } = useI18n();
  const add = useCart((s) => s.add);
  const showToast = useToast((s) => s.show);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [allVariants, setAllVariants] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (params.slug) {
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      
      // Fetch product by slug
      const res = await fetch(`/api/products/${params.slug}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Ensure fresh data
      });
      
      if (!res.ok) {
        if (res.status === 404) {
          setProduct(null);
          return;
        }
        throw new Error(`Failed to fetch product: ${res.status} ${res.statusText}`);
      }
      
      const data: Product = await res.json();
      setProduct(data);
      
      // Fetch all variants (products with same name but different sizes)
      try {
        const allProductsRes = await fetch("/api/products", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });
        
        if (allProductsRes.ok) {
          const allProducts: Product[] = await allProductsRes.json();
          const variants = allProducts.filter(
            (p) => p.nameEn === data.nameEn && p.isActive
          );
          // Sort variants by unit
          variants.sort((a, b) => {
            const order = { "500ml": 1, "1L": 2, "2L": 3 };
            return (order[a.unit as keyof typeof order] || 99) - (order[b.unit as keyof typeof order] || 99);
          });
          setAllVariants(variants);
          // Find the index of the current product in variants
          const currentIdx = variants.findIndex((v) => v.id === data.id);
          setActiveIdx(currentIdx >= 0 ? currentIdx : 0);
        }
      } catch (variantError) {
        // If variants fetch fails, just use the single product
        console.warn("Failed to fetch variants:", variantError);
        setAllVariants([data]);
        setActiveIdx(0);
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  const activeProduct = allVariants[activeIdx] || product;
  const name = activeProduct ? (locale === "ta" ? activeProduct.nameTa : activeProduct.nameEn) : "";
  const description = activeProduct ? (locale === "ta" ? activeProduct.descriptionTa : activeProduct.descriptionEn) : "";
  const tagline = activeProduct ? (locale === "ta" ? activeProduct.taglineTa : activeProduct.taglineEn) : "";

  const handleAddToCart = () => {
    if (!activeProduct) return;
    // Convert database product to cart-compatible format
    const cartProduct = {
      id: activeProduct.id,
      slug: activeProduct.slug,
      nameTa: activeProduct.nameTa,
      nameEn: activeProduct.nameEn,
      imageUrl: activeProduct.imageUrl,
      pricePaisa: activeProduct.pricePaisa,
      unit: activeProduct.unit,
      inStock: activeProduct.inStock,
    };
    add(cartProduct, qty, name, { pricePaisa: activeProduct.pricePaisa, unit: activeProduct.unit });
    showToast(`${name} (${activeProduct.unit}) added to cart`);
  };

  const handleBuyNow = () => {
    if (!activeProduct) return;
    // Convert database product to cart-compatible format
    const cartProduct = {
      id: activeProduct.id,
      slug: activeProduct.slug,
      nameTa: activeProduct.nameTa,
      nameEn: activeProduct.nameEn,
      imageUrl: activeProduct.imageUrl,
      pricePaisa: activeProduct.pricePaisa,
      unit: activeProduct.unit,
      inStock: activeProduct.inStock,
    };
    add(cartProduct, qty, name, { pricePaisa: activeProduct.pricePaisa, unit: activeProduct.unit });
    router.push("/checkout");
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#d97706]" />
      </div>
    );
  }

  if (!product || !activeProduct) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/products" className="px-5 py-2.5 rounded-md bg-[#d97706] text-white hover:bg-[#b76405] font-semibold">
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Image */}
        <div className="p-4 rounded-xl bg-white border shadow-sm">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gradient-to-br from-amber-50 to-amber-100">
            {activeProduct.imageUrl ? (
              <Image
                src={activeProduct.imageUrl}
                alt={name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span>No Image</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col gap-6">
          {/* Product Name */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{name}</h1>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${activeProduct.inStock ? 'text-green-600' : 'text-red-600'}`}>
                {activeProduct.inStock ? t.product.inStock : t.product.outOfStock}
              </span>
              {activeProduct.discount > 0 && (
                <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                  {activeProduct.discount}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Tagline - Shown at the top like Amazon */}
          {tagline && (
            <div className="pb-4 border-b">
              <p className="text-lg text-[#d97706] font-medium italic">
                {tagline}
              </p>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <div className="text-3xl font-bold text-[#d97706]">
              {formatPricePaisa(activeProduct.pricePaisa, locale)}
            </div>
            {activeProduct.discount > 0 && (
              <div className="text-lg text-gray-500 line-through">
                {formatPricePaisa(
                  Math.round(activeProduct.pricePaisa / (1 - activeProduct.discount / 100)),
                  locale
                )}
              </div>
            )}
          </div>

          {/* Size Variants */}
          {allVariants.length > 1 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">{t.product.size}:</div>
              <div className="flex flex-wrap gap-2">
                {allVariants.map((variant, i) => (
                  <button
                    key={variant.id}
                    type="button"
                    className={`px-4 py-2 text-sm rounded-lg border-2 transition-all ${
                      i === activeIdx
                        ? "bg-orange-50 border-orange-400 text-orange-700 font-semibold"
                        : "border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                    onClick={() => {
                      setActiveIdx(i);
                      setQty(1); // Reset quantity when changing size
                    }}
                  >
                    {variant.unit}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">{t.product.quantity}:</div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-300 text-xl leading-none hover:bg-gray-50 hover:border-gray-400 transition-colors"
                disabled={qty <= 1}
              >
                −
              </button>
              <span className="w-12 text-center text-lg font-semibold">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                className="w-10 h-10 rounded-full border-2 border-gray-300 text-xl leading-none hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                ＋
              </button>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div className="pt-4 border-t">
              <div className="text-sm font-medium text-gray-700 mb-2">Description:</div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              className="flex-1 px-6 py-3 rounded-lg bg-[#d97706] text-white hover:bg-[#b76405] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddToCart}
              disabled={!activeProduct.inStock}
            >
              <ShoppingCart className="w-5 h-5" />
              {t.actions.addToCart}
            </button>
            <button
              type="button"
              className="flex-1 px-6 py-3 rounded-lg border-2 border-[#d97706] text-[#d97706] hover:bg-orange-50 font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleBuyNow}
              disabled={!activeProduct.inStock}
            >
              <Zap className="w-5 h-5" />
              {t.actions.buyNow}
            </button>
          </div>

          {/* Additional Info */}
          {activeProduct.sku && (
            <div className="text-xs text-gray-500 pt-2 border-t">
              SKU: {activeProduct.sku}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
