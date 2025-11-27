"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/LanguageProvider";
import { formatPricePaisa } from "@/lib/products";
import { LogOut, MapPin } from "lucide-react";

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
  postalCode: string;
};

export default function AccountPage() {
  const { locale } = useI18n();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
      return;
    }

    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      // Fetch orders
      const ordersRes = await fetch("/api/orders");
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }

      // Fetch addresses (we'll create this API next)
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
      {/* User Info */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
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

      {/* Saved Addresses */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          {locale === "en" ? "Saved Addresses" : "சேமித்த முகவரிகள்"}
        </h2>
        {addresses.length === 0 ? (
          <p className="text-gray-500 text-sm">
            {locale === "en"
              ? "No saved addresses. Add one during checkout."
              : "சேமித்த முகவரிகள் இல்லை. செக்அவுட்டின் போது சேர்க்கவும்."}
          </p>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="border rounded p-4 hover:border-orange-300 transition"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    {addr.label && (
                      <div className="font-medium text-sm">{addr.label}</div>
                    )}
                    <div className="text-sm text-gray-700">
                      {addr.line1}
                      {addr.line2 && `, ${addr.line2}`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {addr.city}, {addr.postalCode}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orders */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
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
    </div>
  );
}
