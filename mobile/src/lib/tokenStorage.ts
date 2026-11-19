import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const isWeb = Platform.OS === "web";

export async function getStoredValue(key: string): Promise<string | null> {
  if (isWeb && typeof localStorage !== "undefined") {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

export async function setStoredValue(key: string, value: string): Promise<void> {
  if (isWeb && typeof localStorage !== "undefined") {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function deleteStoredValue(key: string): Promise<void> {
  if (isWeb && typeof localStorage !== "undefined") {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
