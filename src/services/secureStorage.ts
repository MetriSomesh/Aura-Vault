let inMemoryStore: Record<string, string> = {};

export async function getSecureItem(key: string): Promise<string | null> {
  try {
    // Dynamic import to allow pure Node/test environments to execute without React Native native modules
    const SecureStore = await import('expo-secure-store');
    if (SecureStore && typeof SecureStore.getItemAsync === 'function') {
      return await SecureStore.getItemAsync(key);
    }
  } catch {
    // Fall back to in-memory store in test/web environments
  }
  return inMemoryStore[key] ?? null;
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    const SecureStore = await import('expo-secure-store');
    if (SecureStore && typeof SecureStore.setItemAsync === 'function') {
      await SecureStore.setItemAsync(key, value);
      return;
    }
  } catch {
    // Fall back to in-memory store
  }
  inMemoryStore[key] = value;
}

export function resetInMemoryStore(): void {
  inMemoryStore = {};
}
