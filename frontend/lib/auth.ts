import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_KEY         = "mh:isLoggedIn";
const TOKEN_KEY        = "mh:accessToken";
const DISPLAY_NAME_KEY = "mh:displayName";
const USER_ID_KEY      = "mh:userId";

export async function setLoggedIn(value: boolean) {
  await AsyncStorage.setItem(AUTH_KEY, value ? "1" : "0");
}

export async function isLoggedIn() {
  const v = await AsyncStorage.getItem(AUTH_KEY);
  return v === "1";
}

export async function setToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setDisplayName(name: string) {
  await AsyncStorage.setItem(DISPLAY_NAME_KEY, name);
}

export async function getDisplayName(): Promise<string | null> {
  return AsyncStorage.getItem(DISPLAY_NAME_KEY);
}

export async function setUserId(id: string) {
  await AsyncStorage.setItem(USER_ID_KEY, id);
}

export async function getUserId(): Promise<string | null> {
  return AsyncStorage.getItem(USER_ID_KEY);
}

export async function logout() {
  await Promise.all([
    AsyncStorage.removeItem(AUTH_KEY),
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(DISPLAY_NAME_KEY),
    AsyncStorage.removeItem(USER_ID_KEY),
  ]);
}

