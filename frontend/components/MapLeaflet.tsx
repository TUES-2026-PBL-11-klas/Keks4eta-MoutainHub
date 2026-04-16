import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";

// Fix default marker icons
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

const API_BASE = process.env.EXPO_PUBLIC_TRAIL_SERVICE_URL ?? "http://localhost:5002";

type LatLng = [number, number];

interface Trail {
  id: string;
  name: string;
  category: string;
  difficulty: number;
  status: string;
  distance_km: number;
  elevation_gain_m: number;
  route: {
    type: string;
    // GeoJSON coords are [lng, lat, alt?] — we flip to [lat, lng] for Leaflet
    coordinates: [number, number, number?][];
  };
}

const CENTER: LatLng = [42.6977, 23.3219];

export default function MapLeaflet() {
  const [trails, setTrails] = useState<Trail[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/trails`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setTrails)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <MapContainer
      center={CENTER}
      zoom={11}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {trails.map((trail) => {
        // GeoJSON is [lng, lat, alt?] — Leaflet wants [lat, lng]
        const positions: LatLng[] = trail.route.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );
        const color = TRAIL_COLORS[trail.category] ?? "#416AA6";
        const opacity = STATUS_OPACITY[trail.status] ?? 1;
        const start = positions[0];

        return (
          <div key={trail.id}>
            {/* Polyline for the full path */}
            <Polyline
              positions={positions}
              pathOptions={{ color, opacity, weight: 4 }}
            />

            {/* Marker at the trailhead */}
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
          </div>
        );
      })}

      {error && (
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            background: "rgba(255,255,255,0.9)",
            padding: "4px 8px",
            borderRadius: 6,
            fontSize: 12,
            color: "#c0392b",
            zIndex: 1000,
          }}
        >
          Trail load error: {error}
        </div>
      )}
    </MapContainer>
  );
}
