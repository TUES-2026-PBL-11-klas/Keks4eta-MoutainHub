import { useEffect, useState, type ComponentType } from "react";
import { View } from "react-native";

export default function Map() {
  const [LeafletMap, setLeafletMap] = useState<ComponentType | null>(null);

  useEffect(() => {
    // Dynamic import runs only in the browser, never on the server
    import("./MapLeaflet").then((mod) => {
      setLeafletMap(() => mod.default);
    });
  }, []);

  if (!LeafletMap) {
    return <View style={{ flex: 1, backgroundColor: "#eef3fb" }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <LeafletMap />
    </View>
  );
}