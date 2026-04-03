import React from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";

const COLORS = {
  primaryText: "#416AA6",
  mutedText: "#6D88B6",
  blue: "#9AB8F4",
  fieldBg: "#EEF3FB",
  white: "#FFFFFF",
};

export default function WalkHome() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <View style={styles.card}>
        <Text style={styles.title}>Walk Trail</Text>
        <Text style={styles.subtitle}>Microservice homepage placeholder.</Text>

        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 820,
    backgroundColor: COLORS.fieldBg,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: COLORS.blue,
    padding: 18,
  },
  title: {
    color: COLORS.primaryText,
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.mutedText,
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  button: {
    marginTop: 16,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: COLORS.primaryText,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "900",
  },
});

