import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const memoryStore = new Map();

export const Storage = {
  getItem: async (key) => {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      const val = await AsyncStorage.getItem(key);
      return val;
    } catch (e) {
      console.warn(`[Storage] Fallback getItem for "${key}":`, e?.message);
      return memoryStore.get(key) || null;
    }
  },

  setItem: async (key, value) => {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[Storage] Fallback setItem for "${key}":`, e?.message);
      memoryStore.set(key, value);
    }
  },

  removeItem: async (key) => {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn(`[Storage] Fallback removeItem for "${key}":`, e?.message);
      memoryStore.delete(key);
    }
  },
};
