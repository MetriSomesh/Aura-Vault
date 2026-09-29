import { create } from 'zustand';
import { getSecureItem, setSecureItem } from '../services/secureStorage';

const VAULT_PIN_KEY = 'aura_vault_user_pin';
const DEFAULT_FALLBACK_PIN = '1234';

interface AuthState {
  isUnlocked: boolean;
  isBiometricAvailable: boolean;
  biometricType: string;
  isPinModalVisible: boolean;
  pinError: string | null;
  unlockVault: () => void;
  lockVault: () => void;
  openPinModal: () => void;
  closePinModal: () => void;
  verifyPin: (enteredPin: string) => Promise<boolean>;
  setVaultPin: (newPin: string) => Promise<void>;
  setBiometricStatus: (available: boolean, typeName: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isUnlocked: false,
  isBiometricAvailable: false,
  biometricType: 'Fingerprint',
  isPinModalVisible: false,
  pinError: null,

  unlockVault: () => set({ isUnlocked: true, isPinModalVisible: false, pinError: null }),
  lockVault: () => set({ isUnlocked: false }),
  openPinModal: () => set({ isPinModalVisible: true, pinError: null }),
  closePinModal: () => set({ isPinModalVisible: false, pinError: null }),

  verifyPin: async (enteredPin: string) => {
    try {
      let savedPin = await getSecureItem(VAULT_PIN_KEY);
      if (!savedPin) {
        savedPin = DEFAULT_FALLBACK_PIN;
      }

      if (enteredPin === savedPin) {
        set({ isUnlocked: true, isPinModalVisible: false, pinError: null });
        return true;
      } else {
        set({ pinError: 'Incorrect PIN. Try again.' });
        return false;
      }
    } catch {
      if (enteredPin === DEFAULT_FALLBACK_PIN) {
        set({ isUnlocked: true, isPinModalVisible: false, pinError: null });
        return true;
      }
      set({ pinError: 'Authentication error' });
      return false;
    }
  },

  setVaultPin: async (newPin: string) => {
    await setSecureItem(VAULT_PIN_KEY, newPin);
  },

  setBiometricStatus: (available: boolean, typeName: string) => {
    set({ isBiometricAvailable: available, biometricType: typeName });
  },
}));
