"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatPrice } from "@/lib/utils";

// Fix for default marker icons in Leaflet with Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface PropertyMarker {
  id: string;
  latitude: number;
  longitude: number;
  price: number;
  title: string;
  status?: string;
}

interface PropertyMapProps {
  markers: PropertyMarker[];
  onMarkerClick?: (id: string) => void;
  highlightedId?: string | null;
  center?: [number, number];
  zoom?: number;
}

// Custom price marker icon
function createPriceIcon(price: number, isHighlighted: boolean = false) {
  const formattedPrice = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(price);

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative">
        <div class="bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold shadow-lg whitespace-nowrap transform ${
          isHighlighted ? "scale-125 ring-2 ring-accent" : ""
        }">
          ${formattedPrice}
        </div>
        <div class="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-primary"></div>
      </div>
    `,
    iconSize: [80, 40],
    iconAnchor: [40, 40],
  });
}

// Component to update map bounds
function MapBoundsUpdater({ markers }: { markers: PropertyMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(
        markers.map((m) => [m.latitude, m.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [map, markers]);

  return null;
}

export function PropertyMap({
  markers,
  onMarkerClick,
  highlightedId,
  center = [51.5074, -0.1278], // Default to London
  zoom = 10,
}: PropertyMapProps) {
  const [mounted, setMounted] = useState(false);
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update highlighted marker
  useEffect(() => {
    if (highlightedId) {
      const marker = markerRefs.current.get(highlightedId);
      if (marker) {
        marker.openPopup();
      }
    }
  }, [highlightedId]);

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center bg-muted">
        <span className="text-muted-foreground">Loading map...</span>
      </div>
    );
  }

  return (
    <MapContainer
      center={markers.length > 0 ? [markers[0].latitude, markers[0].longitude] : center}
      zoom={zoom}
      scrollWheelZoom={true}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.length > 0 && <MapBoundsUpdater markers={markers} />}

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.latitude, marker.longitude]}
          icon={createPriceIcon(marker.price, highlightedId === marker.id)}
          ref={(ref) => {
            if (ref) {
              markerRefs.current.set(marker.id, ref);
            }
          }}
          eventHandlers={{
            click: () => onMarkerClick?.(marker.id),
          }}
        >
          <Popup>
            <div className="min-w-[150px]">
              <p className="font-semibold">{formatPrice(marker.price)}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {marker.title}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
