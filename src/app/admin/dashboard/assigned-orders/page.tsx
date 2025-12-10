"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle, Eye, X, MapPin, Phone, User } from "lucide-react";
import { useToast } from "@/store/toast";

interface Order {
  id: string;
  customerName?: string;
  customerPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  totalPaisa: number;
  deliveryStatus: string;
  status: string;
  items: Array<{
    productName: string;
    quantity: number;
    unit: string;
    pricePaisa: number;
  }>;
  createdAt: string;
}

export default function AssignedOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const fetchAssignedOrders = async () => {
    try {
      const res = await fetch("/api/delivery/assigned-orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        showToast("Failed to fetch orders", "error");
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
      showToast("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    if (!confirm("Mark this order as delivered?")) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/deliver`, {
        method: "POST",
      });

      if (res.ok) {
        showToast("Order marked as delivered", "success");
        fetchAssignedOrders();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to update order", "error");
      }
    } catch (error) {
      console.error("Mark delivered error:", error);
      showToast("An error occurred", "error");
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: "bg-gray-100 text-gray-800",
      ASSIGNED: "bg-blue-100 text-blue-800",
      PICKED_UP: "bg-orange-100 text-orange-800",
      IN_TRANSIT: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.deliveryStatus !== "DELIVERED");
  const deliveredOrders = orders.filter((o) => o.deliveryStatus === "DELIVERED");

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Assigned Orders</h1>
        <p className="text-gray-600 mt-2">Orders assigned to you for delivery</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-600">Total Assigned</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-600">Pending Deliveries</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{pendingOrders.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-600">Delivered</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{deliveredOrders.length}</p>
        </div>
      </div>

      {/* Pending Orders */}
      {pendingOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Deliveries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500 font-mono">#{order.id.slice(-8)}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {getDeliveryStatusBadge(order.deliveryStatus)}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{order.customerName || "Guest"}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{order.customerPhone}</p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-700">
                        {order.addressLine1}, {order.city}
                      </p>
                      <p className="text-xs text-gray-500">{order.postalCode}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-lg font-bold text-amber-600">
                    ₹{(order.totalPaisa / 100).toFixed(2)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetailsModal(true);
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMarkDelivered(order.id)}
                      className="px-3 py-1 border border-green-300 rounded-lg text-sm font-medium text-green-700 bg-white hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivered Orders */}
      {deliveredOrders.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery History</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivered On
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {deliveredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      #{order.id.slice(-8)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {order.customerName || "Guest"}
                      </p>
                      <p className="text-xs text-gray-500">{order.customerPhone}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.city}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ₹{(order.totalPaisa / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500">No orders assigned to you yet</p>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-mono text-sm">#{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="text-sm">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Delivery Status</p>
                    {getDeliveryStatusBadge(selectedOrder.deliveryStatus)}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                <p className="text-sm"><strong>Name:</strong> {selectedOrder.customerName}</p>
                <p className="text-sm"><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                <p className="text-sm">
                  <strong>Address:</strong> {selectedOrder.addressLine1}
                  {selectedOrder.addressLine2 && `, ${selectedOrder.addressLine2}`}, {selectedOrder.city}, {selectedOrder.postalCode}
                </p>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{item.productName}</p>
                        <p className="text-sm text-gray-500">{item.unit} × {item.quantity}</p>
                      </div>
                      <p className="font-semibold">₹{(item.pricePaisa * item.quantity / 100).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold">Total</p>
                    <p className="text-lg font-bold text-amber-600">
                      ₹{(selectedOrder.totalPaisa / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {selectedOrder.deliveryStatus !== "DELIVERED" && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleMarkDelivered(selectedOrder.id);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Mark as Delivered</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

