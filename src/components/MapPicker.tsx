"use client";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/LanguageProvider";
import Image from "next/image";

export type LatLng = { lat: number; lng: number };

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
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Google Maps failed to load")));
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
  onChange 
}: { 
  value?: LatLng; 
  onChange: (v: LatLng) => void 
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

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
        
        if (mapInstance.current) {
          mapInstance.current.setCenter(pos);
          mapInstance.current.setZoom(16);
          markerRef.current?.setPosition(pos);
          onChange(pos);
        }
        setIsLoading(false);
      },
      (error) => {
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
    let map: google.maps.Map | null = null;
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
        map = new google.maps.Map(mapRef.current, {
          center: value ?? { lat: 13.0827, lng: 80.2707 }, // Default to Chennai
          zoom: 12,
        });
        mapInstance.current = map;

        // Add marker
        markerRef.current = new google.maps.Marker({
          position: value ?? { lat: 13.0827, lng: 80.2707 },
          map,
          draggable: true,
        });

        // Handle marker drag end
        listener = markerRef.current.addListener("dragend", () => {
          const pos = markerRef.current?.getPosition();
          if (pos) {
            onChange({ lat: pos.lat(), lng: pos.lng() });
          }
        });

        // Initialize autocomplete if input exists
        if (inputRef.current) {
          autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            fields: ["geometry", "name", "formatted_address"],
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
            onChange(latlng);
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
      if (listener) google.maps.event.removeListener(listener);
      if (autocomplete) google.maps.event.clearInstanceListeners(autocomplete);
      if (markerRef.current) markerRef.current.setMap(null);
    };
  }, [value, onChange]);

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