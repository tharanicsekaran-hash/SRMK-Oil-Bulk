"use client";
import { useEffect, useRef } from "react";
import { useI18n } from "@/components/LanguageProvider";

export type LatLng = { lat: number; lng: number };

let mapsLoaderPromise: Promise<void> | null = null;
function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as unknown as { google?: { maps?: { places?: unknown } } };
  if (w.google?.maps?.places) return Promise.resolve();
  if (mapsLoaderPromise) return mapsLoaderPromise;

  const src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&v=weekly`;
  mapsLoaderPromise = new Promise<void>((resolve, reject) => {
    // If a script already exists, reuse it
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

export default function MapPicker({ value, onChange }: { value?: LatLng; onChange: (v: LatLng) => void }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    let map: google.maps.Map | null = null;
    let listener: google.maps.MapsEventListener | null = null;

    (async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
      await loadGoogleMaps(apiKey);

      if (!mapRef.current) return;
      map = new google.maps.Map(mapRef.current, {
        center: value ?? { lat: 13.0827, lng: 80.2707 },
        zoom: 12,
      });

      markerRef.current = new google.maps.Marker({
        position: value ?? { lat: 13.0827, lng: 80.2707 },
        map,
        draggable: true,
      });

      listener = markerRef.current.addListener("dragend", () => {
        const pos = markerRef.current!.getPosition();
        if (pos) onChange({ lat: pos.lat(), lng: pos.lng() });
      });

      if (inputRef.current) {
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current!, {
          fields: ["geometry", "name", "formatted_address"],
          componentRestrictions: { country: ["in"] },
        });
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const loc = place.geometry?.location;
          if (!loc || !map) return;
          const latlng = { lat: loc.lat(), lng: loc.lng() };
          map.setCenter(latlng);
          map.setZoom(16);
          markerRef.current?.setPosition(latlng);
          onChange(latlng);
        });
      }
    })();

    return () => {
      if (listener) listener.remove();
    };
  }, [value, onChange]);

  return (
    <div className="flex flex-col gap-2">
      <input ref={inputRef} type="text" placeholder={t.checkout.address} className="w-full border rounded px-3 py-2" />
      <div ref={mapRef} className="w-full h-72 rounded border" />
      <p className="text-xs text-gray-600">{t.checkout.mapHint}</p>
    </div>
  );
}
