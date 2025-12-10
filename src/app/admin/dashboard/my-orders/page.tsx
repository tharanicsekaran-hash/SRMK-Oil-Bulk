"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/store/toast";
import { Loader2, Package, MapPin, Phone, CheckCircle } from "lucide-react";

type Order = {
  id: string;
  status: string;
  deliveryStatus: string;
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

export default function MyOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const showToast = useToast((state) => state.show);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const res = await fetch("/api/delivery/my-orders");
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

  const handleMarkDelivered = async (orderId: string) => {
    if (!confirm("Mark this order as delivered?")) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/mark-delivered`, {
        method: "POST",
      });

      if (res.ok) {
        showToast("Order marked as delivered", "success");
        fetchMyOrders();
      } else {
        showToast("Failed to update order", "error");
      }
    } catch (error) {
      console.error("Mark delivered error:", error);
      showToast("Failed to update order", "error");
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800";
      case "PICKED_UP":
        return "bg-indigo-100 text-indigo-800";
      case "IN_TRANSIT":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        <h1 className="text-3xl font-bold text-gray-900">My Assigned Orders</h1>
        <p className="text-gray-600 mt-1">Orders assigned to you for delivery</p>
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
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${getDeliveryStatusColor(
                    order.deliveryStatus
                  )}`}
                >
                  {order.deliveryStatus}
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
              {order.deliveryStatus !== "DELIVERED" && (
                <button
                  onClick={() => handleMarkDelivered(order.id)}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No assigned orders</h3>
          <p className="text-gray-600">You currently have no orders assigned to you.</p>
        </div>
      )}
    </div>
  );
}

