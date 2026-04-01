import React, { useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";

import LineBackground from "../assets/images/group-R5.png";
import LogoMark from "../assets/images/logo.svg";
import LogoText from "../assets/images/logotext.svg";

const COLORS = {
  green: "#00DF56",
  blue: "#9AB8F4",
  brown: "#83593D",
  primaryText: "#416AA6",
  mutedText: "#6D88B6",
  card: "#F6F8FC",
  fieldBg: "#EEF3FB",
  white: "#FFFFFF",
  dark: "#111111",
  overlay: "rgba(255,255,255,0.72)",
};

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const styles = useMemo(() => createStyles(isCompact), [isCompact]);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <ImageBackground
        source={LineBackground}
        resizeMode="cover"
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.scrollContent}>
          <View style={styles.topBar}>
            <Image source={LogoMark} style={styles.logoMark} contentFit="contain" />
            <Image source={LogoText} style={styles.logoText} contentFit="contain" />

            <View style={styles.topActions}>
              <Pressable style={styles.iconButton}>
                <Ionicons name="search-outline" size={20} color={COLORS.dark} />
              </Pressable>
              <View style={styles.profileDot} />
            </View>
          </View>

          <View style={styles.heroSection}>
            <View style={styles.heroImage} />

            <View style={styles.formCard}>
              <Text style={styles.title}>Welcome back!</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#90A6CB"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#90A6CB"
                    secureTextEntry={!showPassword}
                    style={styles.passwordInput}
                  />
                  <Pressable
                    onPress={() => setShowPassword((current) => !current)}
                    hitSlop={8}
                    style={styles.passwordIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={COLORS.primaryText}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.optionsRow}>
                <Pressable
                  onPress={() => setRememberMe((current) => !current)}
                  style={styles.checkboxRow}
                >
                  <Ionicons
                    name={rememberMe ? "checkmark-circle" : "ellipse-outline"}
                    size={18}
                    color={COLORS.primaryText}
                  />
                  <Text style={styles.optionText}>Remember me</Text>
                </Pressable>

                <Pressable>
                  <Text style={styles.optionText}>Forgot password?</Text>
                </Pressable>
              </View>

              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Log In</Text>
              </Pressable>

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Don’t have an account? </Text>
                <Link href="/signup" asChild>
                  <Pressable>
                    <Text style={styles.footerLink}>Sign up</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

function createStyles(isCompact) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    background: {
      flex: 1,
    },
    backgroundImage: {
      opacity: 0.23,
    },
    scrollContent: {
      flex: 1,
      paddingTop: Platform.OS === "android" ? 20 : 24,
      paddingBottom: 12,
      paddingHorizontal: isCompact ? 14 : 28,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: isCompact ? 10 : 14,
    },
    logoMark: {
      width: isCompact ? 44 : 56,
      height: isCompact ? 44 : 56,
    },
    logoText: {
      width: isCompact ? 170 : 240,
      height: isCompact ? 48 : 64,
    },
    topActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: isCompact ? 10 : 16,
    },
    iconButton: {
      width: isCompact ? 34 : 40,
      height: isCompact ? 34 : 40,
      alignItems: "center",
      justifyContent: "center",
    },
    profileDot: {
      width: isCompact ? 28 : 36,
      height: isCompact ? 28 : 36,
      borderRadius: 999,
      backgroundColor: COLORS.dark,
    },
    heroSection: {
      alignItems: "center",
    },
    heroImage: {
      width: "100%",
      maxWidth: 1120,
      minHeight: isCompact ? 120 : 210,
      borderRadius: 30,
      overflow: "hidden",
      marginBottom: isCompact ? -12 : -42,
      borderWidth: 1,
      borderColor: "rgba(131, 89, 61, 0.18)",
    },
    formCard: {
      width: "100%",
      maxWidth: 820,
      backgroundColor: COLORS.overlay,
      borderRadius: 28,
      paddingHorizontal: isCompact ? 16 : 30,
      paddingVertical: isCompact ? 16 : 20,
      shadowColor: "#2B4D7A",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 18,
      elevation: 8,
    },
    title: {
      textAlign: "center",
      color: COLORS.primaryText,
      fontSize: isCompact ? 26 : 36,
      fontWeight: "800",
      marginBottom: isCompact ? 10 : 14,
    },
    fieldGroup: {
      marginBottom: 10,
    },
    label: {
      color: COLORS.blue,
      fontSize: isCompact ? 15 : 17,
      fontWeight: "700",
      marginBottom: 4,
      marginLeft: 8,
    },
    input: {
      height: isCompact ? 42 : 46,
      borderWidth: 2,
      borderColor: COLORS.blue,
      borderRadius: 999,
      backgroundColor: COLORS.fieldBg,
      paddingHorizontal: 20,
      color: COLORS.primaryText,
      fontSize: isCompact ? 16 : 18,
    },
    passwordWrapper: {
      minHeight: isCompact ? 42 : 46,
      borderWidth: 2,
      borderColor: COLORS.blue,
      borderRadius: 999,
      backgroundColor: COLORS.fieldBg,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 16,
      paddingRight: 12,
    },
    passwordInput: {
      flex: 1,
      color: COLORS.primaryText,
      fontSize: isCompact ? 16 : 18,
    },
    passwordIcon: {
      marginLeft: 12,
    },
    optionsRow: {
      flexDirection: isCompact ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isCompact ? "flex-start" : "center",
      gap: 8,
      marginTop: 0,
      marginBottom: 12,
      paddingHorizontal: 6,
    },
    checkboxRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    optionText: {
      color: COLORS.primaryText,
      fontSize: isCompact ? 14 : 16,
      fontWeight: "500",
    },
    primaryButton: {
      alignSelf: "center",
      width: isCompact ? "100%" : 300,
      backgroundColor: COLORS.primaryText,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      marginBottom: 10,
    },
    primaryButtonText: {
      color: COLORS.white,
      fontSize: isCompact ? 17 : 18,
      fontWeight: "800",
    },
    footerRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
    },
    footerText: {
      color: COLORS.mutedText,
      fontSize: isCompact ? 14 : 16,
    },
    footerLink: {
      color: COLORS.primaryText,
      fontSize: isCompact ? 16 : 18,
      fontWeight: "800",
    },
  });
}
