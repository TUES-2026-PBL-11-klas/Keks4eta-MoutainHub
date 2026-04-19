import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
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
import { Link, Stack, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

import LineBackground from "../assets/images/group-R5.png";
import HeroImage from "../assets/images/image.png";
import LogoMark from "../assets/images/logo.svg";
import LogoText from "../assets/images/logotext.svg";
import { setLoggedIn, setToken, setDisplayName, setUserId } from "../lib/auth";
import { useLogin, useGoogleLogin } from "../hooks/api";

WebBrowser.maybeCompleteAuthSession();

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
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  const { login, loading, error } = useLogin();
  const { googleLogin, loading: googleLoading, error: googleError } = useGoogleLogin();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    responseType: "id_token",
    scopes: ["openid", "profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.params?.id_token;
      if (idToken) {
        googleLogin(idToken).then(async (result) => {
          if (result) {
            await setToken(result.access_token);
            await setDisplayName(result.display_name);
            await setUserId(result.user_id);
            await setLoggedIn(true);
            router.replace("/(tabs)");
          }
        });
      }
    }
  }, [response, googleLogin, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [formError, setFormError] = useState("");

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
            <Link href="/(tabs)" asChild>
              <Pressable style={styles.brandRow} hitSlop={8}>
                <Image source={LogoMark} style={styles.logoMark} contentFit="contain" />
                <Image source={LogoText} style={styles.logoText} contentFit="contain" />
              </Pressable>
            </Link>

            <View style={styles.topActions}>
              <Link href="/profile" asChild>
                <Pressable style={styles.profileDot} hitSlop={8} />
              </Link>
            </View>
          </View>

          <View style={styles.heroSection}>
            <Image source={HeroImage} style={styles.heroImage} resizeMode="cover" />

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

                <Pressable
                  onPress={() => {
                    setForgotSent(false);
                    setForgotEmail(email);
                    setForgotOpen(true);
                  }}
                >
                  <Text style={styles.optionText}>Forgot password?</Text>
                </Pressable>
              </View>

              {(formError || error) ? (
                <Text style={{ color: "#c0392b", fontWeight: "700", fontSize: 13, marginBottom: 8, textAlign: "center" }}>
                  {formError || error}
                </Text>
              ) : null}

              <Pressable
                style={[styles.primaryButton, loading && { opacity: 0.6 }]}
                disabled={loading}
                onPress={async () => {
                  setFormError("");
                  if (!email.trim())    { setFormError("Email is required.");    return; }
                  if (!password.trim()) { setFormError("Password is required."); return; }
                  const result = await login({ email: email.trim(), password });
                  if (result) {
                    await setToken(result.access_token);
                    await setDisplayName(result.display_name);
                    await setUserId(result.user_id);
                    await setLoggedIn(true);
                    router.replace("/(tabs)");
                  }
                }}
              >
                <Text style={styles.primaryButtonText}>{loading ? "Logging in…" : "Log In"}</Text>
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable
                style={[styles.googleButton, (googleLoading || !request) && { opacity: 0.6 }]}
                disabled={googleLoading || !request}
                onPress={() => promptAsync()}
              >
                <Ionicons name="logo-google" size={20} color={COLORS.primaryText} style={{ marginRight: 8 }} />
                <Text style={styles.googleButtonText}>
                  {googleLoading ? "Logging in…" : "Continue with Google"}
                </Text>
              </Pressable>

              {googleError ? (
                <Text style={{ color: "#c0392b", fontWeight: "700", fontSize: 13, marginBottom: 8, textAlign: "center" }}>
                  {googleError}
                </Text>
              ) : null}

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

      <Modal
        visible={forgotOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setForgotOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setForgotOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Forgot your password?</Text>
            <Text style={styles.modalText}>
              Enter your email and we’ll send you instructions to reset your password.
            </Text>

            <View style={styles.modalFieldGroup}>
              <Text style={styles.modalLabel}>Email</Text>
              <TextInput
                value={forgotEmail}
                onChangeText={setForgotEmail}
                placeholder="Enter your email"
                placeholderTextColor="#90A6CB"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.modalInput}
              />
            </View>

            {forgotSent ? (
              <Text style={styles.modalSuccess}>If the email exists, you’ll receive a reset link.</Text>
            ) : null}

            <View style={styles.modalButtonsRow}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setForgotOpen(false)}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonSecondaryText]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => setForgotSent(true)}
              >
                <Text style={styles.modalButtonText}>Send</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: isCompact ? 8 : 10,
      flexShrink: 1,
    },
    logoMark: {
      width: isCompact ? 44 : 56,
      height: isCompact ? 55 : 60,
    },
    logoText: {
      marginLeft: 350,
      width: isCompact ? 310 : 430,
      height: isCompact ? 60 : 75,
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
      top: 0,
      maxWidth: 1120,
      height: 330,
      borderRadius: 30,
      overflow: "hidden",
      marginBottom: isCompact ? -12 : -42,
    },
    formCard: {
      top: -180,
      width: "100%",
      maxWidth: 820,
      backgroundColor: COLORS.white,
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

    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 10,
      gap: 8,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: COLORS.blue,
      opacity: 0.4,
    },
    dividerText: {
      color: COLORS.mutedText,
      fontSize: isCompact ? 13 : 15,
      fontWeight: "600",
    },
    googleButton: {
      alignSelf: "center",
      width: isCompact ? "100%" : 300,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: COLORS.blue,
      borderRadius: 999,
      paddingVertical: 10,
      marginBottom: 10,
      backgroundColor: COLORS.white,
    },
    googleButtonText: {
      color: COLORS.primaryText,
      fontSize: isCompact ? 15 : 16,
      fontWeight: "700",
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(17,17,17,0.35)",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    modalCard: {
      width: "100%",
      maxWidth: 520,
      backgroundColor: COLORS.white,
      borderRadius: 22,
      padding: 16,
      borderWidth: 2,
      borderColor: COLORS.blue,
      shadowColor: "#2B4D7A",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.16,
      shadowRadius: 18,
      elevation: 10,
    },
    modalTitle: {
      color: COLORS.primaryText,
      fontSize: 20,
      fontWeight: "900",
      textAlign: "center",
      marginBottom: 6,
    },
    modalText: {
      color: COLORS.mutedText,
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 12,
      lineHeight: 20,
    },
    modalFieldGroup: {
      marginBottom: 10,
    },
    modalLabel: {
      color: COLORS.blue,
      fontSize: 14,
      fontWeight: "800",
      marginBottom: 4,
      marginLeft: 8,
    },
    modalInput: {
      height: 44,
      borderWidth: 2,
      borderColor: COLORS.blue,
      borderRadius: 999,
      backgroundColor: COLORS.fieldBg,
      paddingHorizontal: 18,
      color: COLORS.primaryText,
      fontSize: 16,
    },
    modalSuccess: {
      color: COLORS.primaryText,
      fontSize: 13,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 10,
    },
    modalButtonsRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 6,
    },
    modalButton: {
      flex: 1,
      borderRadius: 999,
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    modalButtonPrimary: {
      backgroundColor: COLORS.primaryText,
    },
    modalButtonSecondary: {
      backgroundColor: COLORS.white,
      borderWidth: 2,
      borderColor: COLORS.blue,
    },
    modalButtonText: {
      color: COLORS.white,
      fontSize: 15,
      fontWeight: "900",
    },
    modalButtonSecondaryText: {
      color: COLORS.primaryText,
    },
  });
}
