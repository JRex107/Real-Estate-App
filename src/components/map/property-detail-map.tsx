"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface PropertyDetailMapProps {
  latitude: number;
  longitude: number;
  title: string;
  showApproximateArea?: boolean;
}

export function PropertyDetailMap({
  latitude,
  longitude,
  title,
  showApproximateArea = true,
}: PropertyDetailMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center bg-muted">
        <span className="text-muted-foreground">Loading map...</span>
      </div>
    );
  }

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Approximate area circle for privacy */}
      {showApproximateArea && (
        <Circle
          center={[latitude, longitude]}
          radius={200}
          pathOptions={{
            color: "hsl(var(--primary))",
            fillColor: "hsl(var(--primary))",
            fillOpacity: 0.2,
          }}
        />
      )}

      <Marker position={[latitude, longitude]}>
        <Popup>
          <div className="min-w-[150px]">
            <p className="font-semibold line-clamp-2">{title}</p>
            <p className="text-xs text-muted-foreground">Approximate location</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
