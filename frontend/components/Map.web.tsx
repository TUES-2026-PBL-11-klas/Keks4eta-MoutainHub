import { useEffect, useState, type ComponentType } from "react";
import { View } from "react-native";

interface MapProps { category?: string; }

export default function Map({ category }: MapProps) {
  const [LeafletMap, setLeafletMap] = useState<ComponentType<MapProps> | null>(null);

  useEffect(() => {
    import("./MapLeaflet").then((mod) => {
      setLeafletMap(() => mod.default);
    });
  }, []);

  if (!LeafletMap) {
    return <View style={{ flex: 1, backgroundColor: "#eef3fb" }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <LeafletMap category={category} />
    </View>
  );
}