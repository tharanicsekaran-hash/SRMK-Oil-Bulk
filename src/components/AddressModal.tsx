"use client";
import { useState, useEffect } from "react";
import { X, MapPin } from "lucide-react";
import MapPicker, { type LatLng } from "@/components/MapPicker";
import { useI18n } from "@/components/LanguageProvider";

type Address = {
  id?: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string;
  postalCode: string;
  lat?: number | null;
  lng?: number | null;
  isDefault?: boolean;
};

type AddressModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
  address?: Address | null;
  title: string;
};

export default function AddressModal({
  isOpen,
  onClose,
  onSave,
  address,
  title,
}: AddressModalProps) {
  const { locale } = useI18n();
  const [addressLine, setAddressLine] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [isLoadingCity, setIsLoadingCity] = useState(false);
  const [location, setLocation] = useState<LatLng | undefined>();
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (address) {
      setAddressLine(address.line1 || "");
      setPincode(address.postalCode || "");
      setCity(address.city || "");
      setIsDefault(address.isDefault || false);
      if (address.lat && address.lng) {
        setLocation({ lat: address.lat, lng: address.lng });
      }
    } else {
      // Reset form for new address
      setAddressLine("");
      setPincode("");
      setCity("");
      setLocation(undefined);
      setIsDefault(false);
    }
  }, [address, isOpen]);

  const fetchCityFromPincode = async (pin: string) => {
    if (pin.length !== 6) return;

    setIsLoadingCity(true);
    try {
      const response = await fetch(`/api/geocode?pincode=${pin}`);
      const data = await response.json();

      if (response.ok && data.success && data.city) {
        setCity(data.city);
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

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            locale === "en"
              ? "Unable to get your location. Please enable location services."
              : "உங்கள் இருப்பிடத்தைப் பெற முடியவில்லை. இருப்பிட சேவைகளை இயக்கவும்."
          );
        }
      );
    }
  };

  const handleSave = () => {
    if (!addressLine || !pincode || !city) {
      alert(
        locale === "en"
          ? "Please fill all required fields"
          : "தயவுசெய்து அனைத்து தேவையான புலங்களையும் நிரப்பவும்"
      );
      return;
    }

    onSave({
      id: address?.id,
      line1: addressLine,
      line2: null,
      city,
      postalCode: pincode,
      state: "",
      lat: location?.lat || null,
      lng: location?.lng || null,
      isDefault,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Address Line */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {locale === "en" ? "Address line" : "முகவரி வரி"} *
            </label>
            <input
              type="text"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder={
                locale === "en"
                  ? "House no, Street, Area"
                  : "வீட்டு எண், தெரு, பகுதி"
              }
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {locale === "en" ? "Pincode" : "பின் குறியீடு"} *
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={pincode}
              onChange={(e) => handlePincodeChange(e.target.value)}
              placeholder={locale === "en" ? "6 digit pincode" : "6 இலக்க பின் குறியீடு"}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {locale === "en" ? "City" : "நகரம்"} *
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={
                isLoadingCity
                  ? locale === "en"
                    ? "Fetching city..."
                    : "நகரம் பெறுகிறது..."
                  : locale === "en"
                  ? "City name"
                  : "நகர பெயர்"
              }
              disabled={isLoadingCity}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          {/* Map Picker */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                {locale === "en" ? "Location (Optional)" : "இருப்பிடம் (விருப்பம்)"}
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
              >
                <MapPin className="w-4 h-4" />
                {locale === "en" ? "Use current location" : "தற்போதைய இருப்பிடத்தைப் பயன்படுத்து"}
              </button>
            </div>
            <MapPicker location={location} onChange={setLocation} />
          </div>

          {/* Set as Default */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="setDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="setDefault" className="text-sm">
              {locale === "en"
                ? "Set as default address"
                : "இயல்புநிலை முகவரியாக அமைக்கவும்"}
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-lg hover:bg-gray-100"
          >
            {locale === "en" ? "Cancel" : "ரத்து செய்"}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            {locale === "en" ? "Save Address" : "முகவரியை சேமிக்கவும்"}
          </button>
        </div>
      </div>
    </div>
  );
}

