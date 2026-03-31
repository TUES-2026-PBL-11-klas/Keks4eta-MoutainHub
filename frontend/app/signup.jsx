import React, { useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
  card: "#EDF3FF",
  fieldBg: "#F9FBFF",
  white: "#FFFFFF",
  dark: "#111111",
};

export default function SignupScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  const styles = useMemo(() => createStyles(isCompact), [isCompact]);

  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = (key, value) =>
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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

          <View style={styles.formCard}>
            <Text style={styles.title}>Get Started</Text>

            <View style={styles.nameRow}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  value={form.name}
                  onChangeText={(value) => updateField("name", value)}
                  placeholder="First name"
                  placeholderTextColor="#90A6CB"
                  style={styles.input}
                />
              </View>

              <View style={styles.halfField}>
                <Text style={styles.label}>Surname</Text>
                <TextInput
                  value={form.surname}
                  onChangeText={(value) => updateField("surname", value)}
                  placeholder="Last name"
                  placeholderTextColor="#90A6CB"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={form.email}
                onChangeText={(value) => updateField("email", value)}
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
                  value={form.password}
                  onChangeText={(value) => updateField("password", value)}
                  placeholder="Create a password"
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

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  value={form.confirmPassword}
                  onChangeText={(value) => updateField("confirmPassword", value)}
                  placeholder="Repeat your password"
                  placeholderTextColor="#90A6CB"
                  secureTextEntry={!showConfirmPassword}
                  style={styles.passwordInput}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword((current) => !current)}
                  hitSlop={8}
                  style={styles.passwordIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={COLORS.primaryText}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={() => setAcceptTerms((current) => !current)}
              style={styles.checkboxRow}
            >
              <Ionicons
                name={acceptTerms ? "checkmark-circle" : "ellipse-outline"}
                size={18}
                color={COLORS.primaryText}
              />
              <Text style={styles.optionText}>I accept privacy terms</Text>
            </Pressable>

            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Sign Up</Text>
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/login" asChild>
                <Pressable>
                  <Text style={styles.footerLink}>Log In</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
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
      paddingTop: Platform.OS === "android" ? 54 : 68,
      paddingBottom: 36,
      paddingHorizontal: isCompact ? 16 : 32,
      alignItems: "center",
    },
    topBar: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: isCompact ? 24 : 34,
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
    formCard: {
      width: "100%",
      maxWidth: 980,
      backgroundColor: COLORS.card,
      borderRadius: 30,
      paddingHorizontal: isCompact ? 20 : 42,
      paddingVertical: isCompact ? 24 : 34,
      shadowColor: "#2B4D7A",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 18,
      elevation: 8,
    },
    title: {
      textAlign: "center",
      color: COLORS.primaryText,
      fontSize: isCompact ? 34 : 50,
      fontWeight: "800",
      marginBottom: isCompact ? 20 : 24,
    },
    nameRow: {
      flexDirection: isCompact ? "column" : "row",
      gap: 18,
      marginBottom: 18,
    },
    halfField: {
      flex: 1,
    },
    fieldGroup: {
      marginBottom: 18,
    },
    label: {
      color: COLORS.blue,
      fontSize: isCompact ? 18 : 22,
      fontWeight: "700",
      marginBottom: 10,
      marginLeft: 8,
    },
    input: {
      height: isCompact ? 54 : 62,
      borderWidth: 2,
      borderColor: COLORS.blue,
      borderRadius: 999,
      backgroundColor: COLORS.fieldBg,
      paddingHorizontal: 20,
      color: COLORS.primaryText,
      fontSize: isCompact ? 16 : 18,
    },
    passwordWrapper: {
      minHeight: isCompact ? 54 : 62,
      borderWidth: 2,
      borderColor: COLORS.blue,
      borderRadius: 999,
      backgroundColor: COLORS.fieldBg,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 20,
      paddingRight: 14,
    },
    passwordInput: {
      flex: 1,
      color: COLORS.primaryText,
      fontSize: isCompact ? 16 : 18,
    },
    passwordIcon: {
      marginLeft: 12,
    },
    checkboxRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 8,
      marginBottom: 24,
      paddingHorizontal: 6,
    },
    optionText: {
      color: COLORS.primaryText,
      fontSize: isCompact ? 16 : 18,
      fontWeight: "500",
    },
    primaryButton: {
      alignSelf: "center",
      width: isCompact ? "100%" : 360,
      backgroundColor: COLORS.primaryText,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      marginBottom: 18,
    },
    primaryButtonText: {
      color: COLORS.white,
      fontSize: isCompact ? 22 : 24,
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
      fontSize: isCompact ? 16 : 18,
    },
    footerLink: {
      color: COLORS.primaryText,
      fontSize: isCompact ? 16 : 18,
      fontWeight: "800",
    },
  });
}
