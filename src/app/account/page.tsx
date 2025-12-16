"use client";
import { useEffect, useState, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/LanguageProvider";
import { formatPricePaisa } from "@/lib/products";
import { LogOut, MapPin, Plus, Edit2, Trash2, Star, User, Package } from "lucide-react";
import AddressModal from "@/components/AddressModal";
import { useToast } from "@/store/toast";

type Order = {
  id: string;
  status: string;
  totalPaisa: number;
  createdAt: string;
  items: Array<{
    productName: string;
    unit: string;
    quantity: number;
  }>;
};

type Address = {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
};

function AccountPageContent() {
  const { locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const showToast = useToast((state) => state.show);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "addresses" | "orders">("overview");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
      return;
    }

    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status, router]);

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "addresses" || tab === "orders") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchUserData = async () => {
    try {
      // Fetch orders
      const ordersRes = await fetch("/api/orders");
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }

      // Fetch addresses
      const addressesRes = await fetch("/api/addresses");
      if (addressesRes.ok) {
        const addressesData = await addressesRes.json();
        setAddresses(addressesData.addresses || []);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setSelectedAddress(null);
    setIsModalOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setSelectedAddress(address);
    setIsModalOpen(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm(locale === "en" ? "Delete this address?" : "இந்த முகவரியை நீக்கவா?")) {
      return;
    }

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast(
          locale === "en" ? "Address deleted successfully" : "முகவரி வெற்றிகரமாக நீக்கப்பட்டது",
          "success"
        );
        fetchUserData();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error("Delete address error:", error);
      showToast(
        locale === "en" ? "Failed to delete address" : "முகவரியை நீக்க முடியவில்லை",
        "error"
      );
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: "PATCH",
      });

      if (response.ok) {
        showToast(
          locale === "en" ? "Default address updated" : "இயல்புநிலை முகவரி புதுப்பிக்கப்பட்டது",
          "success"
        );
        fetchUserData();
      } else {
        throw new Error("Failed to set default");
      }
    } catch (error) {
      console.error("Set default error:", error);
      showToast(
        locale === "en" ? "Failed to set default address" : "இயல்புநிலை முகவரியை அமைக்க முடியவில்லை",
        "error"
      );
    }
  };

  const handleSaveAddress = async (address: {
    id?: string;
    line1: string;
    line2?: string | null;
    city: string;
    state?: string;
    postalCode: string;
    lat?: number | null;
    lng?: number | null;
    isDefault?: boolean;
  }) => {
    try {
      const isEditing = !!address.id;
      const url = isEditing ? `/api/addresses/${address.id}` : "/api/addresses";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });

      if (response.ok) {
        showToast(
          locale === "en"
            ? isEditing
              ? "Address updated successfully"
              : "Address added successfully"
            : isEditing
            ? "முகவரி வெற்றிகரமாக புதுப்பிக்கப்பட்டது"
            : "முகவரி வெற்றிகரமாக சேர்க்கப்பட்டது",
          "success"
        );
        setIsModalOpen(false);
        fetchUserData();
      } else {
        const errorData = await response.json();
        console.error("API error:", errorData);
        throw new Error(errorData.error || "Failed to save");
      }
    } catch (error) {
      console.error("Save address error:", error);
      showToast(
        locale === "en" ? "Failed to save address" : "முகவரியை சேமிக்க முடியவில்லை",
        "error"
      );
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          {locale === "en" ? "Loading..." : "ஏற்றுகிறது..."}
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* User Info Header */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold">
              {locale === "en" ? "My Account" : "எனது கணக்கு"}
            </h1>
            <p className="text-gray-600 mt-1">{session.user.phone}</p>
            {session.user.name && (
              <p className="text-sm text-gray-500">{session.user.name}</p>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-4 py-2 text-sm border rounded hover:bg-gray-50 text-red-600"
          >
            <LogOut className="h-4 w-4" />
            {locale === "en" ? "Logout" : "வெளியேறு"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === "overview"
                  ? "border-b-2 border-orange-500 text-orange-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <User className="w-4 h-4" />
              {locale === "en" ? "Overview" : "கண்ணோட்டம்"}
            </button>
            <button
              onClick={() => setActiveTab("addresses")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === "addresses"
                  ? "border-b-2 border-orange-500 text-orange-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <MapPin className="w-4 h-4" />
              {locale === "en" ? "Addresses" : "முகவரிகள்"}
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === "orders"
                  ? "border-b-2 border-orange-500 text-orange-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Package className="w-4 h-4" />
              {locale === "en" ? "Orders" : "ஆர்டர்கள்"}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">
                  {locale === "en" ? "Account Information" : "கணக்கு தகவல்"}
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">{locale === "en" ? "Phone" : "தொலைபேசி"}</span>
                    <span className="font-medium">{session.user.phone}</span>
                  </div>
                  {session.user.name && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">{locale === "en" ? "Name" : "பெயர்"}</span>
                      <span className="font-medium">{session.user.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">{locale === "en" ? "Total Orders" : "மொத்த ஆர்டர்கள்"}</span>
                    <span className="font-medium">{orders.length}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">{locale === "en" ? "Saved Addresses" : "சேமித்த முகவரிகள்"}</span>
                    <span className="font-medium">{addresses.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {locale === "en" ? "Saved Addresses" : "சேமித்த முகவரிகள்"}
                </h2>
                <button
                  onClick={handleAddAddress}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  {locale === "en" ? "Add Address" : "முகவரியைச் சேர்க்கவும்"}
                </button>
              </div>
              {addresses.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  {locale === "en"
                    ? "No saved addresses. Click the button above to add one."
                    : "சேமித்த முகவரிகள் இல்லை. ஒன்றைச் சேர்க்க மேலே உள்ள பொத்தானைக் கிளிக் செய்யவும்."}
                </p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`border rounded p-4 hover:border-orange-300 transition ${
                        addr.isDefault ? "border-orange-500 bg-orange-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {addr.isDefault && (
                              <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                <Star className="w-3 h-3 fill-orange-700" />
                                {locale === "en" ? "Default" : "இயல்புநிலை"}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-700">
                            {addr.line1}
                            {addr.line2 && `, ${addr.line2}`}
                          </div>
                          <div className="text-sm text-gray-600">
                            {addr.city}, {addr.postalCode}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefault(addr.id)}
                              className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded transition"
                              title={locale === "en" ? "Set as default" : "இயல்புநிலையாக அமை"}
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditAddress(addr)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                            title={locale === "en" ? "Edit" : "திருத்து"}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                            title={locale === "en" ? "Delete" : "நீக்கு"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">
                {locale === "en" ? "My Orders" : "எனது ஆர்டர்கள்"}
              </h2>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  {locale === "en"
                    ? "No orders yet. Start shopping!"
                    : "இன்னும் ஆர்டர்கள் இல்லை. ஷாப்பிங் தொடங்குங்கள்!"}
                </p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-sm font-medium">
                            {locale === "en" ? "Order" : "ஆர்டர்"} #{order.id.slice(-8)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString(
                              locale === "en" ? "en-IN" : "ta-IN"
                            )}
                          </div>
                        </div>
                        <div className="text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              order.status === "DELIVERED"
                                ? "bg-green-100 text-green-800"
                                : order.status === "CANCELED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        {order.items.map((item, idx) => (
                          <div key={idx}>
                            {item.productName} ({item.unit}) × {item.quantity}
                          </div>
                        ))}
                      </div>
                      <div className="text-sm font-semibold">
                        {locale === "en" ? "Total:" : "மொத்தம்:"}{" "}
                        {formatPricePaisa(order.totalPaisa, locale)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAddress}
        address={selectedAddress}
        title={
          selectedAddress
            ? locale === "en"
              ? "Edit Address"
              : "முகவரியைத் திருத்து"
            : locale === "en"
            ? "Add New Address"
            : "புதிய முகவரியைச் சேர்க்கவும்"
        }
      />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-6 text-center">Loading...</div>}>
      <AccountPageContent />
    </Suspense>
  );
}
