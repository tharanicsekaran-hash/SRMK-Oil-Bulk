"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/store/toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  X,
  Package,
  Upload,
} from "lucide-react";
import {
  digitsOnly,
  formatAdminPrice,
  getBaseSlugFromSiblings,
  intToInput,
  inputToInt,
  paisaToRupeeInput,
  parseUnitList,
  rupeeInputToPaisa,
} from "@/lib/admin-product-form";

type Product = {
  id: string;
  nameTa: string;
  nameEn: string;
  slug: string;
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

type ProductFormData = Omit<Product, "id">;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const showToast = useToast((state) => state.show);

  const emptyFormData = (): ProductFormData => ({
    nameTa: "",
    nameEn: "",
    slug: "",
    taglineTa: "",
    taglineEn: "",
    descriptionTa: "",
    descriptionEn: "",
    imageUrl: "",
    pricePaisa: 0,
    unit: "",
    inStock: true,
    stockQuantity: 0,
    discount: 0,
    offerTextTa: "",
    offerTextEn: "",
    category: "",
    sku: "",
    isActive: true,
  });

  const [formData, setFormData] = useState<ProductFormData>(emptyFormData());
  const [unitPriceInputs, setUnitPriceInputs] = useState<Record<string, string>>({});
  const [stockInput, setStockInput] = useState("");
  const [discountInput, setDiscountInput] = useState("");

  const parsedUnits = useMemo(() => parseUnitList(formData.unit), [formData.unit]);

  const syncUnitPriceInputs = (units: string[], existing?: Record<string, string>) => {
    const source = existing ?? unitPriceInputs;
    const next: Record<string, string> = {};
    units.forEach((u) => {
      next[u] = source[u] ?? "";
    });
    setUnitPriceInputs(next);
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        showToast("Failed to load products", "error");
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      showToast("Failed to load products", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  const productGroups = useMemo(() => {
    const groups = new Map<string, Product[]>();
    products.forEach((p) => {
      const key = p.nameEn;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    });
    groups.forEach((variants) => {
      variants.sort((a, b) => a.unit.localeCompare(b.unit));
    });
    return Array.from(groups.values());
  }, [products]);

  const filteredGroups = useMemo(() => {
    return productGroups.filter((variants) => {
      const p = variants[0];
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          p.nameEn.toLowerCase().includes(q) ||
          p.nameTa.includes(searchQuery) ||
          variants.some((v) => v.sku?.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      return true;
    });
  }, [productGroups, searchQuery, categoryFilter]);

  const resetNumericInputs = () => {
    setUnitPriceInputs({});
    setStockInput("");
    setDiscountInput("");
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData(emptyFormData());
    resetNumericInputs();
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    const siblings = products
      .filter((p) => p.nameEn === product.nameEn)
      .sort((a, b) => a.unit.localeCompare(b.unit));
    const primary = siblings[0];
    const baseSlug = getBaseSlugFromSiblings(siblings);

    setEditingProduct(primary);
    setFormData({
      nameTa: primary.nameTa,
      nameEn: primary.nameEn,
      slug: baseSlug,
      taglineTa: primary.taglineTa || "",
      taglineEn: primary.taglineEn || "",
      descriptionTa: primary.descriptionTa || "",
      descriptionEn: primary.descriptionEn || "",
      imageUrl: primary.imageUrl || "",
      pricePaisa: primary.pricePaisa,
      unit: siblings.map((s) => s.unit).join(", "),
      inStock: primary.inStock,
      stockQuantity: primary.stockQuantity,
      discount: primary.discount,
      offerTextTa: primary.offerTextTa || "",
      offerTextEn: primary.offerTextEn || "",
      category: primary.category || "",
      sku: primary.sku || "",
      isActive: primary.isActive,
    });
    const prices: Record<string, string> = {};
    siblings.forEach((s) => {
      prices[s.unit] = paisaToRupeeInput(s.pricePaisa);
    });
    setUnitPriceInputs(prices);
    setStockInput(intToInput(primary.stockQuantity));
    setDiscountInput(intToInput(primary.discount));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const stockQuantity = inputToInt(stockInput);
    const discount = inputToInt(discountInput);
    const units = parseUnitList(formData.unit);

    if (units.length === 0) {
      showToast("Please enter at least one unit (comma-separated)", "error");
      return;
    }

    const unitVariants = units.map((unit) => ({
      unit,
      pricePaisa: rupeeInputToPaisa(unitPriceInputs[unit] || ""),
    }));

    if (unitVariants.some((v) => !v.pricePaisa)) {
      showToast("Please enter a price for each unit", "error");
      return;
    }
    if (discount > 100) {
      showToast("Discount cannot exceed 100%", "error");
      return;
    }

    const payload = {
      ...formData,
      stockQuantity,
      discount,
      unit: units.join(", "),
      unitVariants,
    };

    setIsSubmitting(true);

    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";
      
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(
          editingProduct ? "Product updated successfully" : "Product created successfully",
          "success"
        );
        setIsModalOpen(false);
        fetchProducts();
      } else {
        const data = await res.json();
        showToast(data.error || "Operation failed", "error");
      }
    } catch (error) {
      console.error("Product operation error:", error);
      showToast("Operation failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (variants: Product[]) => {
    const name = variants[0].nameEn;
    const sizeNote =
      variants.length > 1 ? ` and all ${variants.length} sizes` : "";
    if (!confirm(`Are you sure you want to delete "${name}"${sizeNote}?`)) return;

    try {
      const res = await fetch(
        `/api/admin/products/${variants[0].id}?allVariants=true`,
        { method: "DELETE" }
      );
      
      if (res.ok) {
        showToast("Product deleted successfully", "success");
        fetchProducts();
      } else {
        showToast("Failed to delete product", "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showToast("Failed to delete product", "error");
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      const res = await fetch("/api/admin/products/upload-image", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Image upload failed", "error");
        return;
      }

      setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl || "" }));
      showToast("Image uploaded successfully", "success");
    } catch (error) {
      console.error("Image upload failed:", error);
      showToast("Image upload failed", "error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((variants) => {
          const product = variants[0];
          const unitLabels = variants.map((v) => v.unit).join(", ");
          const maxDiscount = Math.max(...variants.map((v) => v.discount));
          const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);
          const allInactive = variants.every((v) => !v.isActive);

          return (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 relative">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.nameEn}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}
              {allInactive && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Inactive
                </div>
              )}
              {maxDiscount > 0 && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  {maxDiscount}% OFF
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{product.nameEn}</h3>
              <p className="text-sm text-gray-600 mb-3">{product.nameTa}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-600 shrink-0">Price:</span>
                  <span className="font-semibold text-green-600 text-right">
                    {variants.some((v) => v.pricePaisa !== product.pricePaisa)
                      ? "Varies by size"
                      : formatAdminPrice(product.pricePaisa)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Units:</span>
                  <span className="text-gray-900 text-right">{unitLabels}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Stock:</span>
                  <span className={product.inStock ? "text-green-600" : "text-red-600"}>
                    {totalStock}
                  </span>
                </div>

                {product.category && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="text-gray-900">{product.category}</span>
                  </div>
                )}

                {product.sku && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">SKU:</span>
                    <span className="text-gray-900 font-mono text-xs">{product.sku}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => openEditModal(product)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(variants)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            {searchQuery || categoryFilter !== "all"
              ? "Try adjusting your filters"
              : "Get started by adding your first product"}
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name (Tamil) *
                  </label>
                  <input
                    type="text"
                    value={formData.nameTa}
                    onChange={(e) => setFormData({ ...formData, nameTa: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Units * <span className="text-xs font-normal text-gray-500">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => {
                      const nextUnit = e.target.value;
                      setFormData({ ...formData, unit: nextUnit });
                      syncUnitPriceInputs(parseUnitList(nextUnit));
                    }}
                    placeholder="e.g., 500ml, 1L, 2L"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Each unit appears as a separate size option on the store
                  </p>
                </div>

                {parsedUnits.length > 0 && (
                  <div className="md:col-span-2 space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Price per unit (₹) *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {parsedUnits.map((unit) => (
                        <div key={unit} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-16 shrink-0 font-medium">{unit}</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={unitPriceInputs[unit] ?? ""}
                            onChange={(e) => {
                              const next = digitsOnly(e.target.value);
                              setUnitPriceInputs((prev) => ({ ...prev, [unit]: next }));
                            }}
                            placeholder="e.g., 280"
                            required
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={stockInput}
                    onChange={(e) => {
                      const next = digitsOnly(e.target.value);
                      setStockInput(next);
                      setFormData({ ...formData, stockQuantity: inputToInt(next) });
                    }}
                    placeholder="e.g., 100"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={discountInput}
                    onChange={(e) => {
                      const next = digitsOnly(e.target.value);
                      const capped = next.length > 3 ? next.slice(0, 3) : next;
                      setDiscountInput(capped);
                      setFormData({ ...formData, discount: inputToInt(capped) });
                    }}
                    placeholder="e.g., 10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Oils, Ghee"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL <span className="text-xs text-gray-500">- Relative or full URL</span>
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                      {isUploadingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        {isUploadingImage ? "Uploading..." : "Upload Image"}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                          e.target.value = "";
                        }}
                        disabled={isUploadingImage}
                      />
                    </label>
                    <span className="text-xs text-gray-500">JPG, PNG, WEBP (max 5MB)</span>
                  </div>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="e.g., /images/coconut.jpg or https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Taglines - Short catchy descriptions (shown in product card and detail page) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tagline (English) <span className="text-xs text-gray-500">- Short catchy description</span>
                  </label>
                  <input
                    type="text"
                    value={formData.taglineEn}
                    onChange={(e) => setFormData({ ...formData, taglineEn: e.target.value })}
                    placeholder="e.g., Traditional, flavorful cold-pressed groundnut oil"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Shown in product card and at top of detail page</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tagline (Tamil) <span className="text-xs text-gray-500">- Short catchy description</span>
                  </label>
                  <input
                    type="text"
                    value={formData.taglineTa}
                    onChange={(e) => setFormData({ ...formData, taglineTa: e.target.value })}
                    placeholder="e.g., மரபுத் தயாரிப்பு, சுவை நிறைந்தது"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Shown in product card and at top of detail page</p>
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (English) <span className="text-xs text-gray-500">- Full detailed description</span>
                  </label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Tamil) <span className="text-xs text-gray-500">- Full detailed description</span>
                  </label>
                  <textarea
                    value={formData.descriptionTa}
                    onChange={(e) => setFormData({ ...formData, descriptionTa: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Offer Text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Text (English)
                  </label>
                  <input
                    type="text"
                    value={formData.offerTextEn}
                    onChange={(e) => setFormData({ ...formData, offerTextEn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Text (Tamil)
                  </label>
                  <input
                    type="text"
                    value={formData.offerTextTa}
                    onChange={(e) => setFormData({ ...formData, offerTextTa: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active (Show on store)</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingProduct ? "Update Product" : "Create Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
