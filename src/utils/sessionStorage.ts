import * as SecureStore from "expo-secure-store";

type LocalStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const resolveLocalStore = (): LocalStore | null => {
  try {
    const storage = (globalThis as { localStorage?: LocalStore }).localStorage;
    return storage ?? null;
  } catch {
    return null;
  }
};

const localStore = resolveLocalStore();
const memoryStore = new Map<string, string>();

const readFallback = (key: string) => {
  if (localStore) {
    return localStore.getItem(key);
  }
  return memoryStore.get(key) ?? null;
};

const writeFallback = (key: string, value: string) => {
  if (localStore) {
    localStore.setItem(key, value);
  } else {
    memoryStore.set(key, value);
  }
};

const deleteFallback = (key: string) => {
  if (localStore) {
    localStore.removeItem(key);
  } else {
    memoryStore.delete(key);
  }
};

const safeGet = async (key: string) => {
  if (typeof SecureStore.getItemAsync === "function") {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return readFallback(key);
    }
  }
  return readFallback(key);
};

const safeSet = async (key: string, value: string) => {
  if (typeof SecureStore.setItemAsync === "function") {
    try {
      await SecureStore.setItemAsync(key, value);
      return;
    } catch {
      writeFallback(key, value);
      return;
    }
  }
  writeFallback(key, value);
};

const safeDelete = async (key: string) => {
  if (typeof SecureStore.deleteItemAsync === "function") {
    try {
      await SecureStore.deleteItemAsync(key);
      return;
    } catch {
      deleteFallback(key);
      return;
    }
  }
  deleteFallback(key);
};

const sessionStorage = {
  getItem: safeGet,
  setItem: safeSet,
  deleteItem: safeDelete,
};

export default sessionStorage;


