"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/store/toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  X,
  Package,
} from "lucide-react";

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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const showToast = useToast((state) => state.show);

  const [formData, setFormData] = useState<ProductFormData>({
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

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryFilter, products]);

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

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.nameTa.includes(searchQuery) ||
          p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  };

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
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
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nameTa: product.nameTa,
      nameEn: product.nameEn,
      slug: product.slug,
      taglineTa: product.taglineTa || "",
      taglineEn: product.taglineEn || "",
      descriptionTa: product.descriptionTa || "",
      descriptionEn: product.descriptionEn || "",
      imageUrl: product.imageUrl || "",
      pricePaisa: product.pricePaisa,
      unit: product.unit,
      inStock: product.inStock,
      stockQuantity: product.stockQuantity,
      discount: product.discount,
      offerTextTa: product.offerTextTa || "",
      offerTextEn: product.offerTextEn || "",
      category: product.category || "",
      sku: product.sku || "",
      isActive: product.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";
      
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      
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
        {filteredProducts.map((product) => (
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
              {!product.isActive && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Inactive
                </div>
              )}
              {product.discount > 0 && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  {product.discount}% OFF
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{product.nameEn}</h3>
              <p className="text-sm text-gray-600 mb-3">{product.nameTa}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-semibold text-green-600">
                    ₹{(product.pricePaisa / 100).toFixed(2)} / {product.unit}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Stock:</span>
                  <span className={product.inStock ? "text-green-600" : "text-red-600"}>
                    {product.stockQuantity} units
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
                  onClick={() => handleDelete(product.id, product.nameEn)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., 500ml, 1L"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={(formData.pricePaisa / 100).toFixed(2)}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePaisa: Math.round(parseFloat(e.target.value) * 100) })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })
                    }
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
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
