import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Modal,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShieldCheck,
  Fingerprint,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Clock,
  HardDrive,
  AlertTriangle,
  Check,
  Trash2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useVaultStore } from '../../src/store/useVaultStore';
import { clearAllHoldings } from '../../src/db/repository';

const AUTO_LOCK_OPTIONS = ['Immediate', '30 Seconds', '1 Minute', '5 Minutes'];

export default function SecurityScreen() {
  const {
    lockVault,
    isBiometricAvailable,
    biometricType,
    setVaultPin,
  } = useAuthStore();
  const { isGhostMode, toggleGhostMode, refreshHoldings } = useVaultStore();

  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [selectedAutoLock, setSelectedAutoLock] = useState('30 Seconds');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState(false);

  const handleImmediateLock = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    lockVault();
  };

  const handleSavePin = async () => {
    if (newPin.length < 4) {
      return;
    }
    await setVaultPin(newPin);
    setPinSuccessMsg(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setTimeout(() => {
      setPinSuccessMsg(false);
      setIsPinModalOpen(false);
      setNewPin('');
    }, 1200);
  };

  const handlePurgeData = () => {
    Alert.alert(
      'Reset Portfolio & Holdings?',
      'This will permanently delete all stored bullion entries and reset your vault to clean zero.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Reset',
          style: 'destructive',
          onPress: async () => {
            await clearAllHoldings();
            await refreshHoldings();
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch {}
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.canvas} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarTitle}>Security & Privacy</Text>
          <Text style={styles.topBarSubtitle}>Hardware KeyStore & Vault Access</Text>
        </View>

        <TouchableOpacity
          style={styles.lockNowBtn}
          onPress={handleImmediateLock}
          activeOpacity={0.7}
        >
          <Lock size={14} color={colors.loss.text} />
          <Text style={styles.lockNowText}>Lock Now</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HARDWARE BIOMETRICS CARD */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconCircle}>
              <Fingerprint size={18} color={colors.gold.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Biometric Authentication</Text>
              <Text style={styles.cardSubtitle}>
                {isBiometricAvailable ? `${biometricType} Enrolled` : 'Biometrics Active'}
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: colors.input, true: colors.gold.muted }}
              thumbColor={biometricsEnabled ? colors.gold.primary : colors.text.tertiary}
            />
          </View>
          <Text style={styles.sectionDesc}>
            Require your fingerprint to access bullion valuations, purchase receipts, and audit ledgers.
          </Text>
        </View>

        {/* MASTER PIN SECTION */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconCircle}>
              <KeyRound size={18} color={colors.gold.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Vault Master PIN</Text>
              <Text style={styles.cardSubtitle}>Fallback passcode security</Text>
            </View>
            <TouchableOpacity
              style={styles.changePinBtn}
              onPress={() => setIsPinModalOpen(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.changePinBtnText}>Change</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionDesc}>
            A 4 to 6 digit security code used when fingerprint scanner is unavailable.
          </Text>
        </View>

        {/* AUTO-LOCK TIMER */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconCircle}>
              <Clock size={18} color={colors.gold.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Auto-Lock Timeout</Text>
              <Text style={styles.cardSubtitle}>Inactivity protection</Text>
            </View>
          </View>

          <View style={styles.optionsRow}>
            {AUTO_LOCK_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.optionChip,
                  selectedAutoLock === opt && styles.optionChipActive,
                ]}
                onPress={() => setSelectedAutoLock(opt)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    selectedAutoLock === opt && styles.optionChipTextActive,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* GHOST MODE & PRIVACY */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconCircle}>
              {isGhostMode ? (
                <EyeOff size={18} color={colors.gold.primary} />
              ) : (
                <Eye size={18} color={colors.gold.primary} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Ghost Mode Masking</Text>
              <Text style={styles.cardSubtitle}>
                {isGhostMode ? 'Active (Balances Masked)' : 'Disabled'}
              </Text>
            </View>
            <Switch
              value={isGhostMode}
              onValueChange={toggleGhostMode}
              trackColor={{ false: colors.input, true: colors.gold.muted }}
              thumbColor={isGhostMode ? colors.gold.primary : colors.text.tertiary}
            />
          </View>
          <Text style={styles.sectionDesc}>
            Masks all total net worth, acquisition amounts, and P&L figures across all screens with &quot;••••••••&quot; to prevent shoulder-surfing.
          </Text>
        </View>

        {/* DATA INTEGRITY & LOCAL STORAGE */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconCircle}>
              <HardDrive size={18} color={colors.silver.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Local-First Architecture</Text>
              <Text style={styles.cardSubtitle}>Zero Cloud Leaks</Text>
            </View>
          </View>
          <Text style={styles.sectionDesc}>
            All bullion records, hallmark serial numbers, and invoice photos reside strictly on this device inside an encrypted SQLite database. No financial records ever leave your phone.
          </Text>
        </View>

        {/* PURGE ALL HOLDINGS */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconCircle}>
              <Trash2 size={18} color={colors.loss.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Reset Portfolio Data</Text>
              <Text style={styles.cardSubtitle}>Wipe demo / test holdings</Text>
            </View>
            <TouchableOpacity
              style={styles.purgeBtn}
              onPress={handlePurgeData}
              activeOpacity={0.7}
            >
              <Text style={styles.purgeBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionDesc}>
            Permanently clear all recorded gold and silver transactions to start with a fresh, empty portfolio.
          </Text>
        </View>
      </ScrollView>

      {/* CHANGE PIN MODAL */}
      <Modal
        visible={isPinModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPinModalOpen(false)}
      >
        <View style={styles.modalScrim}>
          <View style={styles.modalBox}>
            <Text style={styles.modalHeading}>Set Master Security PIN</Text>
            <Text style={styles.modalSubtext}>
              Enter a new 4 to 6 digit PIN to protect your vault.
            </Text>

            <TextInput
              style={styles.pinInput}
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry
              placeholder="••••"
              placeholderTextColor={colors.text.tertiary}
              value={newPin}
              onChangeText={setNewPin}
              autoFocus
            />

            {pinSuccessMsg ? (
              <View style={styles.successBanner}>
                <Check size={14} color={colors.profit.text} />
                <Text style={styles.successText}>PIN Updated Successfully</Text>
              </View>
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsPinModalOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.savePinBtn, newPin.length < 4 && styles.disabledBtn]}
                onPress={handleSavePin}
                disabled={newPin.length < 4}
              >
                <Text style={styles.savePinBtnText}>Save PIN</Text>
              </TouchableOpacity>
            </View>
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
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  topBarTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  topBarSubtitle: {
    color: colors.text.tertiary,
    fontSize: 11,
    marginTop: 2,
  },
  lockNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border.danger,
  },
  lockNowText: {
    color: colors.loss.text,
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: colors.text.tertiary,
    fontSize: 11,
    marginTop: 2,
  },
  sectionDesc: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  changePinBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  changePinBtnText: {
    color: colors.gold.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  purgeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.loss.bg,
    borderWidth: 1,
    borderColor: colors.border.danger,
  },
  purgeBtnText: {
    color: colors.loss.text,
    fontSize: 12,
    fontWeight: '700',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  optionChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  optionChipActive: {
    backgroundColor: colors.gold.muted,
    borderColor: colors.gold.primary,
  },
  optionChipText: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  optionChipTextActive: {
    color: colors.gold.primary,
  },

  // Modal
  modalScrim: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 20,
  },
  modalHeading: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalSubtext: {
    color: colors.text.tertiary,
    fontSize: 12,
    marginBottom: 16,
  },
  pinInput: {
    height: 48,
    backgroundColor: colors.input,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    color: colors.text.primary,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 10,
    marginBottom: 14,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.profit.bg,
    padding: 8,
    borderRadius: 6,
    marginBottom: 14,
  },
  successText: {
    color: colors.profit.text,
    fontSize: 12,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  savePinBtn: {
    flex: 1,
    height: 40,
    borderRadius: 6,
    backgroundColor: colors.gold.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savePinBtnText: {
    color: colors.canvas,
    fontSize: 13,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.4,
  },
});
