"use client";

import { useEffect, useState, useRef } from "react";
import { useToast } from "@/store/toast";
import {
  Search,
  Eye,
  UserCheck,
  CheckCircle,
  Loader2,
  X,
  MapPin,
  Phone,
  Package,
  Copy,
  Map,
  Volume2,
  VolumeX,
} from "lucide-react";

type Order = {
  id: string;
  status: string;
  deliveryStatus: string;
  totalPaisa: number;
  customerName?: string;
  customerPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  lat?: number | null;
  lng?: number | null;
  assignedToId?: string;
  assignedTo?: { name?: string };
  createdAt: string;
  items: {
    productName: string;
    quantity: number;
    unit: string;
    pricePaisa: number;
  }[];
};

type DeliveryUser = {
  id: string;
  name?: string;
  phone: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [deliveryUsers, setDeliveryUsers] = useState<DeliveryUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState("all");
  const [assignedToFilter, setAssignedToFilter] = useState("all");
  const [pincodeFilter, setPincodeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, yesterday, last7days, last30days
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDeliveryUser, setSelectedDeliveryUser] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Notification state - using useRef to persist across renders
  const lastOrderCountRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const showToast = useToast((state) => state.show);

  useEffect(() => {
    fetchOrders();
    fetchDeliveryUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling for new orders every 30 seconds - only start after initialization
  useEffect(() => {
    // Wait a bit for initial load to complete
    const startPolling = setTimeout(() => {
      console.log("🔄 Starting polling for new orders (every 30 seconds)...");
      
      const interval = setInterval(() => {
        fetchOrdersQuietly();
      }, 30000); // 30 seconds

      return () => {
        console.log("⏹️  Stopping polling");
        clearInterval(interval);
      };
    }, 5000); // Start polling 5 seconds after component mount

    return () => {
      clearTimeout(startPolling);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, deliveryStatusFilter, assignedToFilter, pincodeFilter, dateFilter, orders]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        // Initialize the count on first load
        if (!isInitializedRef.current) {
          lastOrderCountRef.current = data.length;
          isInitializedRef.current = true;
          console.log("📊 Initial order count:", data.length);
          console.log("✅ Order tracking initialized");
        }
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

  const fetchOrdersQuietly = async () => {
    // Don't check if not initialized yet
    if (!isInitializedRef.current) {
      console.log("⏳ Skipping check - not initialized yet");
      return;
    }

    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        const currentCount = data.length;
        const previousCount = lastOrderCountRef.current;
        
        console.log(`🔍 [${new Date().toLocaleTimeString()}] Checking orders: Previous=${previousCount}, Current=${currentCount}`);
        
        // Check if there are new orders
        if (currentCount > previousCount) {
          const newOrders = currentCount - previousCount;
          
          console.log(`🎉 NEW ORDERS DETECTED: ${newOrders} new order(s)!`);
          console.log(`🔊 Sound enabled: ${soundEnabled}`);
          
          // Show toast notification
          showToast(
            `🎉 ${newOrders} new order${newOrders > 1 ? "s" : ""} received!`,
            "success"
          );
          
          // Play notification sound
          if (soundEnabled) {
            console.log("🔔 Playing notification sound...");
            playNotificationSound();
          }
          
          // Update the count
          lastOrderCountRef.current = currentCount;
        }
        
        // Update orders list
        setOrders(data);
      }
    } catch (error) {
      console.error("❌ Failed to fetch orders quietly:", error);
    }
  };

  const playNotificationSound = () => {
    // Create a simple beep sound using Web Audio API
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // Frequency in Hz
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const fetchDeliveryUsers = async () => {
    try {
      const res = await fetch("/api/admin/delivery-users");
      if (res.ok) {
        const data = await res.json();
        setDeliveryUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch delivery users:", error);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search
    if (searchQuery) {
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customerPhone?.includes(searchQuery)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    // Delivery status filter
    if (deliveryStatusFilter !== "all") {
      filtered = filtered.filter((o) => o.deliveryStatus === deliveryStatusFilter);
    }

    // Assigned to filter
    if (assignedToFilter !== "all") {
      if (assignedToFilter === "unassigned") {
        filtered = filtered.filter((o) => !o.assignedToId);
      } else {
        filtered = filtered.filter((o) => o.assignedToId === assignedToFilter);
      }
    }

    // Pincode filter
    if (pincodeFilter) {
      filtered = filtered.filter((o) => o.postalCode?.includes(pincodeFilter));
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      const last7DaysStart = new Date(todayStart);
      last7DaysStart.setDate(last7DaysStart.getDate() - 7);
      const last30DaysStart = new Date(todayStart);
      last30DaysStart.setDate(last30DaysStart.getDate() - 30);

      filtered = filtered.filter((o) => {
        const orderDate = new Date(o.createdAt);
        
        switch (dateFilter) {
          case "today":
            return orderDate >= todayStart;
          case "yesterday":
            return orderDate >= yesterdayStart && orderDate < todayStart;
          case "last7days":
            return orderDate >= last7DaysStart;
          case "last30days":
            return orderDate >= last30DaysStart;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(filtered);
  };

  const openDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const openAssignModal = (order: Order) => {
    setSelectedOrder(order);
    setSelectedDeliveryUser(order.assignedToId || "");
    setIsAssignModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedOrder || !selectedDeliveryUser) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryUserId: selectedDeliveryUser }),
      });

      if (res.ok) {
        showToast("Order assigned successfully", "success");
        setIsAssignModalOpen(false);
        fetchOrders();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to assign order", "error");
      }
    } catch (error) {
      console.error("Assign error:", error);
      showToast("Failed to assign order", "error");
    } finally {
      setIsSubmitting(false);
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
        fetchOrders();
      } else {
        showToast("Failed to update order", "error");
      }
    } catch (error) {
      console.error("Mark delivered error:", error);
      showToast("Failed to update order", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        showToast("Address copied to clipboard!", "success");
      },
      () => {
        showToast("Failed to copy address", "error");
      }
    );
  };

  const openMap = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-gray-100 text-gray-800";
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all orders • Last count: {lastOrderCountRef.current}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              console.log("🧪 Manual check triggered");
              fetchOrdersQuietly();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors text-sm"
            title="Manually check for new orders"
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Check Now</span>
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              soundEnabled
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title={soundEnabled ? "Disable notification sound" : "Enable notification sound"}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Sound On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Sound Off</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <input
              type="text"
              placeholder="Filter by pincode"
              value={pincodeFilter}
              onChange={(e) => setPincodeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELED">Canceled</option>
            </select>

            <select
              value={deliveryStatusFilter}
              onChange={(e) => setDeliveryStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Delivery Status</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
            </select>

            <select
              value={assignedToFilter}
              onChange={(e) => setAssignedToFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Delivery Agents</option>
              <option value="unassigned">Unassigned</option>
              {deliveryUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.phone}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
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
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    #{order.id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customerName || "Guest"}</div>
                    <div className="text-sm text-gray-500">{order.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.city}, {order.postalCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    ₹{(order.totalPaisa / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getDeliveryStatusColor(
                        order.deliveryStatus
                      )}`}
                    >
                      {order.deliveryStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.assignedTo?.name || "Unassigned"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDetailModal(order)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openAssignModal(order)}
                        className="text-purple-600 hover:text-purple-800"
                        title="Assign Delivery"
                      >
                        <UserCheck className="w-5 h-5" />
                      </button>
                      {order.deliveryStatus !== "DELIVERED" && (
                        <button
                          onClick={() => handleMarkDelivered(order.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Mark as Delivered"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Order ID:</span>
                    <p className="font-mono font-semibold">#{selectedOrder.id.slice(-8)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <p className="font-semibold">
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          selectedOrder.status
                        )}`}
                      >
                        {selectedOrder.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Delivery Status:</span>
                    <p>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getDeliveryStatusColor(
                          selectedOrder.deliveryStatus
                        )}`}
                      >
                        {selectedOrder.deliveryStatus}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a
                      href={`tel:${selectedOrder.customerPhone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedOrder.customerPhone}
                    </a>
                  </div>
                  {selectedOrder.customerName && (
                    <div className="text-gray-700">
                      <span className="font-medium">Name:</span> {selectedOrder.customerName}
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 text-sm text-gray-700">
                      <p>{selectedOrder.addressLine1}</p>
                      {selectedOrder.addressLine2 && <p>{selectedOrder.addressLine2}</p>}
                      <p>
                        {selectedOrder.city}
                        {selectedOrder.state && `, ${selectedOrder.state}`}
                      </p>
                      <p className="font-medium">Pincode: {selectedOrder.postalCode}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => {
                        const fullAddress = [
                          selectedOrder.addressLine1,
                          selectedOrder.addressLine2,
                          selectedOrder.city,
                          selectedOrder.state,
                          selectedOrder.postalCode,
                        ]
                          .filter(Boolean)
                          .join(", ");
                        copyToClipboard(fullAddress);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Address
                    </button>
                    
                    {selectedOrder.lat && selectedOrder.lng && (
                      <button
                        onClick={() => openMap(selectedOrder.lat!, selectedOrder.lng!)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
                      >
                        <Map className="w-4 h-4" />
                        View on Map
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} x {item.unit}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ₹{((item.pricePaisa * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-green-600">
                    ₹{(selectedOrder.totalPaisa / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {isAssignModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Assign Delivery Agent</h2>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Order: <span className="font-mono font-semibold">#{selectedOrder.id.slice(-8)}</span>
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Delivery Agent
                </label>
                <select
                  value={selectedDeliveryUser}
                  onChange={(e) => setSelectedDeliveryUser(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select Agent --</option>
                  {deliveryUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={isSubmitting || !selectedDeliveryUser}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
