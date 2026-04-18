import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_KEY = "mh:isLoggedIn";
const TOKEN_KEY = "mh:accessToken";

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

export async function logout() {
  await AsyncStorage.removeItem(AUTH_KEY);
  await AsyncStorage.removeItem(TOKEN_KEY);
}

