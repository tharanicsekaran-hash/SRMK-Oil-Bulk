"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/store/toast";
import { Loader2, Package, MapPin, Phone, UserPlus } from "lucide-react";

type Order = {
  id: string;
  status: string;
  totalPaisa: number;
  customerName?: string;
  customerPhone?: string;
  addressLine1?: string;
  city?: string;
  postalCode?: string;
  createdAt: string;
  items: {
    productName: string;
    quantity: number;
    unit: string;
  }[];
};

export default function AvailableOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const showToast = useToast((state) => state.show);

  useEffect(() => {
    fetchUnassignedOrders();
  }, []);

  const fetchUnassignedOrders = async () => {
    try {
      const res = await fetch("/api/delivery/available-orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        showToast("Failed to load orders", "error");
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      showToast("Failed to load orders", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelfAssign = async (orderId: string) => {
    if (!confirm("Assign this order to yourself?")) return;

    try {
      const res = await fetch(`/api/delivery/self-assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      if (res.ok) {
        showToast("Order assigned to you successfully", "success");
        fetchUnassignedOrders();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to assign order", "error");
      }
    } catch (error) {
      console.error("Self assign error:", error);
      showToast("Failed to assign order", "error");
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Available Orders</h1>
        <p className="text-gray-600 mt-1">Unassigned orders you can pick up</p>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-mono font-semibold text-gray-900">#{order.id.slice(-8)}</p>
                </div>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                  Unassigned
                </span>
              </div>

              {/* Customer Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{order.customerPhone}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <span>
                    {order.addressLine1}, {order.city}, {order.postalCode}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Order Items:</p>
                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-900">
                      {item.quantity}x {item.productName} ({item.unit})
                    </p>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Amount:</span>
                <span className="text-lg font-bold text-green-600">
                  ₹{(order.totalPaisa / 100).toFixed(2)}
                </span>
              </div>

              {/* Action */}
              <button
                onClick={() => handleSelfAssign(order.id)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Assign to Me
              </button>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No available orders</h3>
          <p className="text-gray-600">All orders are currently assigned to delivery agents.</p>
        </div>
      )}
    </div>
  );
}
