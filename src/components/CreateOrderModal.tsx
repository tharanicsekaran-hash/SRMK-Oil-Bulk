"use client";

import { useState, useEffect } from "react";
import { X, Search, Plus, Minus, Trash2, MapPin, Loader2 } from "lucide-react";
import MapPicker, { type LatLng } from "@/components/MapPicker";

type Product = {
  id: string;
  nameEn: string;
  nameTa: string;
  unit: string;
  pricePaisa: number;
  inStock: boolean;
  stockQuantity: number;
};

type OrderItem = {
  productId: string;
  productName: string;
  unit: string;
  pricePaisa: number;
  quantity: number;
};

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateOrderModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateOrderModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  
  // Address
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [location, setLocation] = useState<LatLng | undefined>();
  
  // Payment & Notes
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY">("COD");
  const [paymentStatus, setPaymentStatus] = useState<"PENDING" | "PAID" | "FAILED" | "REFUNDED">("PENDING");
  const [deliveryStatus, setDeliveryStatus] = useState<"PENDING" | "ASSIGNED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED">("PENDING");
  const [notes, setNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter((p) =>
        p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameTa.includes(searchQuery)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const addProduct = (product: Product) => {
    const existingItem = orderItems.find(
      (item) => item.productId === product.id
    );

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: product.id,
          productName: `${product.nameEn} (${product.unit})`,
          unit: product.unit,
          pricePaisa: product.pricePaisa,
          quantity: 1,
        },
      ]);
    }
    setSearchQuery("");
  };

  const updateQuantity = (productId: string, delta: number) => {
    setOrderItems(
      orderItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId));
  };

  const calculateTotal = () => {
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.pricePaisa * item.quantity,
      0
    );
    const deliveryCharge = subtotal < 50000 ? 5000 : 0;
    return { subtotal, deliveryCharge, total: subtotal + deliveryCharge };
  };

  const handleSubmit = async () => {
    // Validation
    if (orderItems.length === 0) {
      setError("Please add at least one product");
      return;
    }
    if (!customerName || !customerPhone) {
      setError("Please enter customer name and phone");
      return;
    }
    if (!addressLine1 || !city || !pincode) {
      setError("Please enter delivery address");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const { deliveryCharge } = calculateTotal();
      
      const res = await fetch("/api/admin/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            unit: item.unit,
            pricePaisa: item.pricePaisa,
            qty: item.quantity,
          })),
          customerName,
          customerPhone,
          addressLine1,
          addressLine2,
          city,
          state,
          postalCode: pincode,
          lat: location?.lat,
          lng: location?.lng,
          notes,
          paymentMethod,
          paymentStatus,
          deliveryStatus,
          deliveryChargePaisa: deliveryCharge,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Create order API error:", errorData);
        throw new Error(errorData.error || "Failed to create order");
      }

      // Reset form
      setOrderItems([]);
      setCustomerName("");
      setCustomerPhone("");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setState("");
      setPincode("");
      setLocation(undefined);
      setNotes("");
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("❌ Create order error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create order";
      setError(errorMessage);
      // Keep the error visible for user to read
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const { subtotal, deliveryCharge, total } = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Order</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Products & Customer */}
            <div className="space-y-6">
              {/* Product Search & Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Add Products</h3>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Product Suggestions */}
                {searchQuery && filteredProducts.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg max-h-48 overflow-y-auto mb-4">
                    {filteredProducts.slice(0, 5).map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addProduct(product)}
                        disabled={!product.inStock}
                        className="w-full px-4 py-3 text-left hover:bg-white transition border-b border-gray-200 last:border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900">{product.nameEn}</div>
                            <div className="text-sm text-gray-600">
                              {product.unit} • ₹{(product.pricePaisa / 100).toFixed(2)}
                            </div>
                          </div>
                          {!product.inStock && (
                            <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Products */}
                <div className="space-y-3">
                  {orderItems.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No products added yet. Search and select products above.
                    </p>
                  ) : (
                    orderItems.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">{item.productName}</div>
                          <div className="text-xs text-gray-600">
                            ₹{(item.pricePaisa / 100).toFixed(2)} each
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 w-20 text-right">
                          ₹{((item.pricePaisa * item.quantity) / 100).toFixed(2)}
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-600 hover:text-red-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Customer Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Details</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Customer Name *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="tel"
                    placeholder="Customer Phone *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Address & Order Details */}
            <div className="space-y-6">
              {/* Delivery Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Address</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Address Line 1 *"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Address Line 2 (Optional)"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City *"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Pincode *"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Location Picker */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Delivery Location (Optional)</h3>
                <MapPicker value={location} onChange={setLocation} />
              </div>

              {/* Order Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Settings</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as "COD" | "RAZORPAY")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="COD">Cash on Delivery</option>
                        <option value="RAZORPAY">Online Payment (Razorpay)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Payment Status</label>
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value as "PENDING" | "PAID" | "FAILED" | "REFUNDED")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="FAILED">Failed</option>
                        <option value="REFUNDED">Refunded</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Delivery Status</label>
                    <select
                      value={deliveryStatus}
                      onChange={(e) => setDeliveryStatus(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="PICKED_UP">Picked Up</option>
                      <option value="IN_TRANSIT">In Transit</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Notes</h3>
                <textarea
                  placeholder="Any special instructions or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{(subtotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Charge:</span>
                    <span className="font-medium">₹{(deliveryCharge / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-lg text-blue-600">₹{(total / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || orderItems.length === 0}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Order...
              </>
            ) : (
              "Create Order"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

