"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import MapPicker, { type LatLng } from "@/components/MapPicker";
import { useI18n } from "@/components/LanguageProvider";
import { useCart } from "@/store/cart";
import { formatPricePaisa } from "@/lib/products";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { locale } = useI18n();
  const router = useRouter();
  const { items, clear } = useCart();
  const { data: session } = useSession();
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [isLoadingCity, setIsLoadingCity] = useState(false);
  const [location, setLocation] = useState<LatLng | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<"COD">("COD");
  const [comments, setComments] = useState("");
  const [saveAddress, setSaveAddress] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.pricePaisa * i.qty, 0);
  const deliveryChargePaisa = subtotal < 50000 ? 5000 : 0;
  const totalPaisa = subtotal + deliveryChargePaisa;

  // Pre-fill user data from session
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setName(session.user.name);
      if (session.user.phone) setPhone(session.user.phone);
    }
  }, [session]);

  const fetchCityFromPincode = async (pin: string) => {
    if (pin.length !== 6) return;
    
    setIsLoadingCity(true);
    try {
      console.log("Fetching city for pincode:", pin);
      const response = await fetch(`/api/geocode?pincode=${pin}`);
      const data = await response.json();
      console.log("Geocode API response:", data);
      
      if (response.ok && data.success && data.city) {
        console.log("Found city:", data.city);
        setCity(data.city);
      } else {
        console.error("Failed to fetch city:", data.error);
        // Allow user to manually enter city if auto-fill fails
      }
    } catch (error) {
      console.error("Error fetching city from pincode:", error);
    } finally {
      setIsLoadingCity(false);
    }
  };

  const handlePincodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 6);
    setPincode(numericValue);
    
    if (numericValue.length === 6) {
      fetchCityFromPincode(numericValue);
    } else {
      setCity("");
    }
  };

  const placeOrder = async () => {
    if (!name || !phone || !addressLine || !pincode || !city) {
      alert("Please fill all required fields / தயவுசெய்து அனைத்து தேவையான புலங்களையும் நிரப்பவும்");
      return;
    }

    try {
      // Save address if checkbox is checked and user is logged in
      if (saveAddress && session?.user?.id) {
        await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            line1: addressLine,
            city,
            postalCode: pincode,
            state: "",
            lat: location?.lat,
            lng: location?.lng,
          }),
        });
      }

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
          addressLine1: addressLine,
          addressLine2: "",
          city,
          state: "",
          postalCode: pincode,
          lat: location?.lat,
          lng: location?.lng,
          notes: comments,
          paymentMethod,
          deliveryChargePaisa,
        }),
      });
      if (!res.ok) throw new Error("Order failed / ஆர்டர் தோல்வியடைந்தது");
      clear();
      router.push("/account");
    } catch {
      alert("Failed to place order. Please try again. / ஆர்டர் செய்ய தவறிவிட்டது. மீண்டும் முயற்சிக்கவும்.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-5">
        <div className="text-xs text-gray-600">Cart / கார்ட் ▸ Checkout / செக்அவுட் ▸ Payment / பணம் செலுத்துதல்</div>
        <h1 className="text-2xl font-semibold mt-1">Checkout / செக்அவுட்</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3 space-y-4">
          <div className="border rounded p-4 space-y-3">
            <div className="font-medium">Contact / தொடர்பு</div>
            <div className="grid gap-3">
              <input 
                className="border rounded px-3 py-2" 
                placeholder="Name / பெயர்" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
              <input 
                className="border rounded px-3 py-2" 
                placeholder="Phone / தொலைபேசி" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
              />
            </div>
          </div>

          <div className="border rounded p-4 space-y-4">
            <div className="font-medium">Delivery Address / விநியோக முகவரி</div>
            <div className="grid gap-3">
              <input 
                className="border rounded px-3 py-2" 
                placeholder="Address line / முகவரி வரி *" 
                value={addressLine} 
                onChange={(e) => setAddressLine(e.target.value)} 
                required
              />
              <input 
                className="border rounded px-3 py-2" 
                placeholder="Pincode / பின் குறியீடு *" 
                value={pincode} 
                onChange={(e) => handlePincodeChange(e.target.value)} 
                required
                maxLength={6}
                inputMode="numeric"
              />
              <input 
                className={`border rounded px-3 py-2 ${isLoadingCity ? 'bg-gray-50' : ''}`}
                placeholder="City / நகரம் *" 
                value={city} 
                onChange={(e) => setCity(e.target.value)}
                required
                disabled={isLoadingCity}
              />
              {isLoadingCity && (
                <p className="text-xs text-gray-500">Loading city... / நகரம் ஏற்றப்படுகிறது...</p>
              )}
            </div>
            {session && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="rounded"
                />
                {locale === "en"
                  ? "Save this address to my account"
                  : "இந்த முகவரியை எனது கணக்கில் சேமிக்கவும்"}
              </label>
            )}
          </div>

          <div className="border rounded p-4 space-y-4">
            <div className="font-medium">Delivery Location (Optional) / விநியோக இடம் (விருப்பமானது)</div>
            {location && (
              <p className="text-xs text-green-600">
                ✓ Location set: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            )}
            <MapPicker value={location} onChange={setLocation} />
          </div>

          <div className="border rounded p-4 space-y-3">
            <div className="font-medium">Payment Method / கட்டண முறை</div>
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="radio" 
                name="pm" 
                checked={paymentMethod === "COD"} 
                onChange={() => setPaymentMethod("COD")} 
              />
              Cash on Delivery / டெலிவரியின் போது பணம்
            </label>
          </div>

          <div className="border rounded p-4 space-y-2">
            <div className="font-medium">Additional Notes / கூடுதல் குறிப்புகள்</div>
            <textarea
              className="border rounded px-3 py-2 w-full min-h-24"
              placeholder="Any special instructions or notes... / ஏதேனும் சிறப்பு அறிவுறுத்தல்கள் அல்லது குறிப்புகள்..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="border rounded p-4 space-y-3">
            <div className="font-semibold">Order Summary / ஆர்டர் சுருக்கம்</div>
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
              <div className="text-sm text-gray-600">Subtotal / உபத்திரை</div>
              <div className="font-semibold">{formatPricePaisa(subtotal, locale)}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-gray-600">Delivery / விநியோகம்</div>
              <div className="font-medium">{formatPricePaisa(deliveryChargePaisa, locale)}</div>
            </div>
            <div className="flex justify-between border-t pt-2">
              <div className="text-sm font-medium">Total / மொத்தம்</div>
              <div className="font-semibold">{formatPricePaisa(totalPaisa, locale)}</div>
            </div>
            <button 
              className="w-full mt-4 px-4 py-3 rounded bg-[#d97706] text-white hover:bg-[#b76405] font-medium" 
              onClick={placeOrder}
            >
              Place Order / ஆர்டர் செய்க
            </button>
            <div className="text-xs text-gray-500 text-center mt-2">
              Cash on Delivery available in serviceable areas. / சேவை செய்யக்கூடிய பகுதிகளில் டெலிவரியின் போது பணம் செலுத்தும் வசதி உள்ளது
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
