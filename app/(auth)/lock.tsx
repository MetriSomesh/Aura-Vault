import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fingerprint, Lock, ShieldCheck, KeyRound, Delete } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { useBiometrics } from '../../src/hooks/useBiometrics';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function LockScreen() {
  const { triggerBiometricAuth } = useBiometrics();
  const {
    isPinModalVisible,
    openPinModal,
    closePinModal,
    verifyPin,
    pinError,
    unlockVault,
  } = useAuthStore();

  const [enteredPin, setEnteredPin] = useState<string>('');

  useEffect(() => {
    // Automatically prompt biometrics on mount
    triggerBiometricAuth();
  }, [triggerBiometricAuth]);

  const handleKeyPress = async (digit: string) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      if (nextPin.length === 4) {
        const isValid = await verifyPin(nextPin);
        if (!isValid) {
          setTimeout(() => setEnteredPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    if (enteredPin.length > 0) {
      setEnteredPin(enteredPin.slice(0, -1));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.canvas} />

      {/* Top Header / Branding */}
      <View style={styles.header}>
        <View style={styles.brandBadge}>
          <Lock size={16} color={colors.gold.primary} />
          <Text style={styles.brandTitle}>AURA VAULT</Text>
        </View>
        <View style={styles.encryptionPill}>
          <View style={styles.pulseDot} />
          <Text style={styles.encryptionText}>BIOMETRIC ENCRYPTED</Text>
        </View>
      </View>

      {/* Center Biometric Target */}
      <View style={styles.centerArea}>
        <View style={styles.rippleOuter}>
          <View style={styles.rippleMiddle}>
            <TouchableOpacity
              style={styles.sensorButton}
              activeOpacity={0.7}
              onPress={triggerBiometricAuth}
            >
              <Fingerprint size={52} color={colors.gold.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.instructionText}>Touch sensor to unlock your vault</Text>
        <Text style={styles.subInstructionText}>HOLD SENSOR FOR 0.4s</Text>
      </View>

      {/* Bottom Actions & Security Seal */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.passcodeButton}
          activeOpacity={0.8}
          onPress={openPinModal}
        >
          <KeyRound size={16} color={colors.text.secondary} />
          <Text style={styles.passcodeButtonText}>Use Passcode / PIN</Text>
        </TouchableOpacity>

        <View style={styles.securityBadge}>
          <ShieldCheck size={14} color={colors.profit.text} />
          <Text style={styles.securityBadgeText}>
            Local Enclave Encrypted • 256-bit AES
          </Text>
        </View>

        {/* Development Quick Bypass for Testing on Simulators */}
        <TouchableOpacity
          style={styles.devBypass}
          onPress={unlockVault}
          activeOpacity={0.6}
        >
          <Text style={styles.devBypassText}>[Demo Bypass: Tap to Enter]</Text>
        </TouchableOpacity>
      </View>

      {/* PIN Fallback Modal */}
      <Modal
        visible={isPinModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closePinModal}
      >
        <View style={styles.modalScrim}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Enter Vault PIN</Text>
            <Text style={styles.modalSubtitle}>Default PIN: 1234</Text>

            {/* 4-digit indicators */}
            <View style={styles.pinDotsRow}>
              {[0, 1, 2, 3].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.pinDot,
                    enteredPin.length > index && styles.pinDotFilled,
                  ]}
                />
              ))}
            </View>

            {pinError && <Text style={styles.errorText}>{pinError}</Text>}

            {/* Keypad */}
            <View style={styles.keypad}>
              {[
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['', '0', 'DEL'],
              ].map((row, rIdx) => (
                <View key={rIdx} style={styles.keypadRow}>
                  {row.map((item, cIdx) => {
                    if (item === '') {
                      return <View key={cIdx} style={styles.keyEmpty} />;
                    }
                    if (item === 'DEL') {
                      return (
                        <TouchableOpacity
                          key={cIdx}
                          style={styles.keyButton}
                          onPress={handleDelete}
                        >
                          <Delete size={20} color={colors.text.secondary} />
                        </TouchableOpacity>
                      );
                    }
                    return (
                      <TouchableOpacity
                        key={cIdx}
                        style={styles.keyButton}
                        onPress={() => handleKeyPress(item)}
                      >
                        <Text style={styles.keyNumber}>{item}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.cancelButton} onPress={closePinModal}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 3,
  },
  encryptionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.profit.text,
  },
  encryptionText: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  centerArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleOuter: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleMiddle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensorButton: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.gold.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  instructionText: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '500',
    marginTop: 28,
  },
  subInstructionText: {
    color: colors.gold.primary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: 6,
  },
  footer: {
    alignItems: 'center',
    gap: 16,
    marginBottom: 10,
  },
  passcodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.interactive,
    backgroundColor: colors.card,
    justifyContent: 'center',
  },
  passcodeButtonText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityBadgeText: {
    color: colors.text.secondary,
    fontSize: 11,
  },
  devBypass: {
    padding: 4,
  },
  devBypassText: {
    color: colors.text.tertiary,
    fontSize: 11,
    textDecorationLine: 'underline',
  },

  // PIN Modal
  modalScrim: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.elevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 36,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.border.subtle,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.active,
    marginBottom: 20,
  },
  modalTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  modalSubtitle: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 4,
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.border.active,
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: colors.gold.primary,
    borderColor: colors.gold.primary,
  },
  errorText: {
    color: colors.loss.text,
    fontSize: 12,
    marginBottom: 12,
  },
  keypad: {
    width: '100%',
    maxWidth: 280,
    gap: 12,
    marginTop: 10,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keyButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyEmpty: {
    width: 64,
    height: 64,
  },
  keyNumber: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
});
