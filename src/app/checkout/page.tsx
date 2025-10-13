"use client";
import { useState } from "react";
import MapPicker, { type LatLng } from "@/components/MapPicker";
import { useI18n } from "@/components/LanguageProvider";
import { useCart } from "@/store/cart";
import { formatPricePaisa } from "@/lib/products";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { items, clear } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [location, setLocation] = useState<LatLng | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<"COD">("COD");
  const [comments, setComments] = useState("");

  const subtotal = items.reduce((sum, i) => sum + i.pricePaisa * i.qty, 0);
  const deliveryChargePaisa = subtotal < 50000 ? 5000 : 0;
  const totalPaisa = subtotal + deliveryChargePaisa;

  const placeOrder = async () => {
    if (!name || !phone || !addressLine1 || !location) {
      alert("Please fill all required fields and pin your location on the map.");
      return;
    }
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.id,
            productSlug: i.slug,
            productName: i.name,
            unit: i.unit,
            pricePaisa: i.pricePaisa,
            qty: i.qty,
          })),
          customerName: name,
          customerPhone: phone,
          addressLine1,
          addressLine2,
          city: "",
          state: "",
          postalCode: "",
          lat: location.lat,
          lng: location.lng,
          notes: comments,
          paymentMethod,
          deliveryChargePaisa,
        }),
      });
      if (!res.ok) throw new Error("Order failed");
      clear();
      router.push("/account");
    } catch (e) {
      alert("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-5">
        <div className="text-xs text-gray-600">Cart ▸ Checkout ▸ Payment</div>
        <h1 className="text-2xl font-semibold mt-1">{t.checkout.title}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3 space-y-4">
          <div className="border rounded p-4 space-y-3">
            <div className="font-medium">Contact</div>
            <div className="grid gap-3">
              <input className="border rounded px-3 py-2" placeholder="Name / பெயர்" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="Phone / தொலைபேசி" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="border rounded p-4 space-y-3">
            <div className="font-medium">Delivery</div>
            <div className="grid gap-3">
              <input className="border rounded px-3 py-2" placeholder="Address line 1 / முகவரி வரி 1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="Address line 2 / முகவரி வரி 2 (optional)" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="font-medium">{t.checkout.address}</div>
              <MapPicker value={location} onChange={setLocation} />
            </div>
          </div>

          <div className="border rounded p-4 space-y-3">
            <div className="font-medium">{t.checkout.paymentMethod}</div>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="pm" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
              {t.checkout.cod}
            </label>
          </div>

          <div className="border rounded p-4 space-y-2">
            <div className="font-medium">{t.checkout.commentsTitle}</div>
            <textarea
              className="border rounded px-3 py-2 w-full min-h-24"
              placeholder={t.checkout.commentsPlaceholder}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="border rounded p-4 space-y-3">
            <div className="font-semibold">Order Summary</div>
            <div className="space-y-2 max-h-60 overflow-auto">
              {items.map((i) => (
                <div key={`${i.id}-${i.unit}`} className="flex justify-between text-sm">
                  <div>
                    {i.name} ({i.unit}) × {i.qty}
                  </div>
                  <div>{formatPricePaisa(i.pricePaisa * i.qty, locale)}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t pt-3">
              <div className="text-sm text-gray-600">{t.cart.subtotal}</div>
              <div className="font-semibold">{formatPricePaisa(subtotal, locale)}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-gray-600">Delivery</div>
              <div className="font-medium">{formatPricePaisa(deliveryChargePaisa, locale)}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-gray-600">Total</div>
              <div className="font-semibold">{formatPricePaisa(totalPaisa, locale)}</div>
            </div>
            <button className="w-full mt-2 px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600" onClick={placeOrder}>
              {t.checkout.placeOrder}
            </button>
            <div className="text-xs text-gray-500">Cash on Delivery available in serviceable areas.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
