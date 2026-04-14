"use client";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/LanguageProvider";
import Image from "next/image";

export type LatLng = { lat: number; lng: number };
export type PlaceDetails = {
  addressLine?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  formattedAddress?: string;
};

declare global {
  interface Window {
    google?: typeof google;
  }
}

let mapsLoaderPromise: Promise<void> | null = null;

async function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.google?.maps?.places) return;
  if (mapsLoaderPromise) return mapsLoaderPromise;

  const src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&v=weekly`;
  
  mapsLoaderPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-google-maps]");
    if (existing) {
      if (window.google?.maps?.places) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Google Maps failed to load")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.setAttribute("data-google-maps", "true");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });
  
  return mapsLoaderPromise;
}

export default function MapPicker({ 
  value, 
  onChange,
  onPlaceSelected,
}: { 
  value?: LatLng; 
  onChange: (v: LatLng) => void;
  onPlaceSelected?: (place: PlaceDetails) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const initialCenterRef = useRef<LatLng>(value ?? { lat: 13.0827, lng: 80.2707 });
  const onChangeRef = useRef(onChange);
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onPlaceSelectedRef.current = onPlaceSelected;
  }, [onPlaceSelected]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        console.log("Current location obtained:", pos);
        
        // Always call onChange to update parent component
        onChangeRef.current(pos);
        
        // Update map if it's initialized
        if (mapInstance.current) {
          mapInstance.current.setCenter(pos);
          mapInstance.current.setZoom(16);
          markerRef.current?.setPosition(pos);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setError(`Unable to retrieve your location: ${error.message}`);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    let autocomplete: google.maps.places.Autocomplete | null = null;
    let listener: google.maps.MapsEventListener | null = null;

    const initializeMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error("Google Maps API key is missing: set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in environment");
        return;
      }

      try {
        await loadGoogleMaps(apiKey);

        if (!mapRef.current) return;

        // Initialize map
        const map = new google.maps.Map(mapRef.current, {
          center: initialCenterRef.current,
          zoom: 12,
        });
        mapInstance.current = map;

        // Add marker
        markerRef.current = new google.maps.Marker({
          position: initialCenterRef.current,
          map,
          draggable: true,
        });

        // Handle marker drag end
        listener = markerRef.current.addListener("dragend", () => {
          const pos = markerRef.current?.getPosition();
          if (pos) {
            onChangeRef.current({ lat: pos.lat(), lng: pos.lng() });
          }
        });

        // Initialize autocomplete if input exists
        if (inputRef.current) {
          autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            fields: ["geometry", "name", "formatted_address", "address_components"],
            componentRestrictions: { country: "in" },
          });

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete?.getPlace();
            const loc = place?.geometry?.location;
            if (!loc || !map) return;

            const latlng = { lat: loc.lat(), lng: loc.lng() };
            map.setCenter(latlng);
            map.setZoom(16);
            markerRef.current?.setPosition(latlng);
            onChangeRef.current(latlng);

            if (onPlaceSelectedRef.current) {
              const components = place?.address_components ?? [];
              const getByType = (type: string) =>
                components.find((component) => component.types.includes(type))?.long_name;

              const sublocality =
                getByType("sublocality_level_1") ||
                getByType("sublocality") ||
                getByType("neighborhood");
              const locality = getByType("locality") || getByType("postal_town");
              const district = getByType("administrative_area_level_2");
              const state = getByType("administrative_area_level_1");
              const postalCode = getByType("postal_code");

              onPlaceSelectedRef.current({
                addressLine:
                  (place?.name && sublocality && place.name !== sublocality)
                    ? `${place.name}, ${sublocality}`
                    : place?.name || sublocality || place?.formatted_address || "",
                city: locality || district || "",
                state: state || "",
                postalCode: postalCode || "",
                formattedAddress: place?.formatted_address || "",
              });
            }
          });
        }
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to load Google Maps. Please try again later.");
      }
    };

    initializeMap();

    return () => {
      // Cleanup
      if (listener && window.google?.maps?.event) {
        window.google.maps.event.removeListener(listener);
      }
      if (autocomplete && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
      if (markerRef.current) markerRef.current.setMap(null);
    };
  }, []);

  useEffect(() => {
    if (!value || !mapInstance.current || !markerRef.current) return;
    mapInstance.current.setCenter(value);
    markerRef.current.setPosition(value);
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Search for delivery address / விநியோக முகவரியைத் தேடவும்" 
          className="flex-1 border rounded px-3 py-2" 
          aria-label="Search for delivery address"
        />
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="p-0 bg-transparent text-white hover:bg-gray-100 hover:bg-opacity-20 rounded-full disabled:opacity-50 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-300"
          title="Use my current location / எனது தற்போதைய இருப்பிடத்தைப் பயன்படுத்தவும்"
          aria-label="Use current location"
        >
          {isLoading ? (
            <span className="h-5 w-5 animate-spin">⟳</span>
          ) : (
            <Image 
              src="/location-pin.png"
              alt="Location"
              width={40}
              height={40}
              className="w-10 h-10"
              aria-hidden="true"
            />
          )}
        </button>
      </div>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      <div 
        ref={mapRef} 
        className="w-full h-72 rounded border"
        aria-label="Map"
      />
      
      <p className="text-xs text-gray-600">
        {t?.checkout?.mapHint || "Drag the marker to set your exact location"}
      </p>
    </div>
  );
}