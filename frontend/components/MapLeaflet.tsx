import "leaflet/dist/leaflet.css";
import L from "leaflet";
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { useTrails } from "@/hooks/api";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const TRAIL_COLORS: Record<string, string> = {
  mtb: "#83593D",
  ski: "#9AB8F4",
  hiking: "#00DF56",
  all: "#416AA6",
};

const STATUS_OPACITY: Record<string, number> = {
  open: 1,
  partial: 0.6,
  closed: 0.3,
};

const BULGARIA_CENTER: [number, number] = [42.7339, 25.4858];
const BULGARIA_ZOOM = 7;
const USER_ZOOM     = 11;

function LocationFlyTo({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, USER_ZOOM, { duration: 1.5 });
  }, [coords]);
  return null;
}

export default function MapLeaflet({ category }: { category?: string }) {
  const { trails: allTrails, loading, error } = useTrails();
  const trails = category ? allTrails.filter((t) => t.category === category) : allTrails;
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  }, []);

  return (
    <MapContainer
      center={BULGARIA_CENTER}
      zoom={BULGARIA_ZOOM}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <LocationFlyTo coords={userCoords} />

      {userCoords && (
        <Marker position={userCoords}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {trails.map((trail) => {
        if (!trail.route?.coordinates?.length) return null;
        const positions: [number, number][] = trail.route.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );
        const color = TRAIL_COLORS[trail.category] ?? "#416AA6";
        const opacity = STATUS_OPACITY[trail.status] ?? 1;
        const start = positions[0];

        return (
          <React.Fragment key={trail.id}>
            <Polyline positions={positions} pathOptions={{ color, opacity, weight: 4 }} />
            {start && (
              <Marker position={start}>
                <Popup>
                  <strong>{trail.name}</strong>
                  <br />
                  {trail.category} · {trail.status}
                  <br />
                  {trail.distance_km} km · +{trail.elevation_gain_m} m
                  <br />
                  Difficulty: {trail.difficulty}/5
                </Popup>
              </Marker>
            )}
          </React.Fragment>
        );
      })}

      {loading && (
        <div style={{
          position: "absolute", top: 8, left: 8, zIndex: 1000,
          background: "rgba(255,255,255,0.9)",
          padding: "4px 10px", borderRadius: 6,
          fontSize: 12, color: "#416AA6",
        }}>
          Loading trails...
        </div>
      )}

      {error && (
        <div style={{
          position: "absolute", bottom: 8, left: 8, zIndex: 1000,
          background: "rgba(255,255,255,0.9)",
          padding: "4px 10px", borderRadius: 6,
          fontSize: 12, color: "#c0392b",
        }}>
          {error}
        </div>
      )}
    </MapContainer>
  );
}
