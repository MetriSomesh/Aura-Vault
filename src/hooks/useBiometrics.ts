import { useEffect, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../store/useAuthStore';

export function useBiometrics() {
  const { unlockVault, setBiometricStatus, openPinModal } = useAuthStore();

  const checkBiometrics = useCallback(async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      const typeName = supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
        ? 'Face ID'
        : 'Fingerprint';

      setBiometricStatus(hasHardware && isEnrolled, typeName);
    } catch {
      setBiometricStatus(false, 'None');
    }
  }, [setBiometricStatus]);

  useEffect(() => {
    checkBiometrics();
  }, [checkBiometrics]);

  const triggerBiometricAuth = useCallback(async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Fallback to PIN modal if biometrics not enrolled
        openPinModal();
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Aura Bullion Vault',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });

      if (result.success) {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        unlockVault();
      } else {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch {}
        if (result.error === 'user_fallback') {
          openPinModal();
        }
      }
    } catch {
      openPinModal();
    }
  }, [openPinModal, unlockVault]);

  return {
    triggerBiometricAuth,
    checkBiometrics,
  };
}
