import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Minus, Plus, Lock, Check, Pencil } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/theme/colors';
import { MetalType, PurityGrade } from '../../src/types/bullion';
import { useVaultStore } from '../../src/store/useVaultStore';
import {
  calculateBreakEvenRate,
  calculatePureWeight,
  calculateTotalCost,
  getPurityFactor,
} from '../../src/utils/calculations';
import { insertHolding, getHoldingById, updateHolding } from '../../src/db/repository';
import { MetalSwitcher } from '../../src/components/entry/MetalSwitcher';
import { PurityChips } from '../../src/components/entry/PurityChips';
import { BillUploadBox } from '../../src/components/entry/BillUploadBox';

export default function AddEntryModal() {
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEditing = Boolean(editId);
  const { spotRate, refreshHoldings } = useVaultStore();

  const [metalType, setMetalType] = useState<MetalType>('GOLD');
  const [purityKarat, setPurityKarat] = useState<PurityGrade>('24K');
  const [title, setTitle] = useState('');
  const [weightGrams, setWeightGrams] = useState(10.0);
  const [purchaseRate, setPurchaseRate] = useState(
    spotRate.gold24kPerGram.toString()
  );
  const [makingCharges, setMakingCharges] = useState('1200');
  const [location, setLocation] = useState('Bank Locker (HDFC #402)');
  const [huidCode, setHuidCode] = useState('');
  const [invoicePhotoUri, setInvoicePhotoUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing holding if in edit mode
  useEffect(() => {
    async function loadExistingHolding() {
      if (editId) {
        const item = await getHoldingById(editId);
        if (item) {
          setMetalType(item.metalType);
          setPurityKarat(item.purityKarat);
          setTitle(item.title);
          setWeightGrams(item.grossWeightGrams);
          setPurchaseRate(item.purchaseRatePerGram.toString());
          setMakingCharges(item.makingCharges.toString());
          setLocation(item.custodyLocation);
          setHuidCode(item.huidCode || '');
          setInvoicePhotoUri(item.invoicePhotoUri || null);
        }
      }
    }
    loadExistingHolding();
  }, [editId]);

  // Update default rate when metal changes
  const handleMetalChange = (metal: MetalType) => {
    setMetalType(metal);
    if (metal === 'GOLD') {
      setPurityKarat('24K');
      setPurchaseRate(spotRate.gold24kPerGram.toString());
    } else {
      setPurityKarat('999');
      setPurchaseRate(spotRate.silver999PerGram.toString());
    }
  };

  // Stepper adjustments
  const adjustWeight = (delta: number) => {
    setWeightGrams((prev) => Math.max(0.1, Number((prev + delta).toFixed(2))));
  };

  // Calculations
  const rateNum = parseFloat(purchaseRate) || 0;
  const makingNum = parseFloat(makingCharges) || 0;
  const purityFactor = getPurityFactor(purityKarat);
  const pureWeight = calculatePureWeight(weightGrams, purityKarat);
  const costBreakdown = calculateTotalCost(weightGrams, rateNum, makingNum, 3.0);
  const breakEvenRate = calculateBreakEvenRate(costBreakdown.totalCost, pureWeight);

  const handleSave = async () => {
    if (weightGrams <= 0 || rateNum <= 0) return;

    setIsSubmitting(true);
    const itemTitle =
      title.trim().length > 0
        ? title.trim()
        : `${weightGrams}g ${metalType === 'GOLD' ? 'Gold' : 'Silver'} (${purityKarat})`;

    try {
      if (isEditing && editId) {
        await updateHolding(editId, {
          metalType,
          title: itemTitle,
          purityKarat,
          purityPercentage: purityFactor,
          grossWeightGrams: weightGrams,
          pureWeightGrams: pureWeight,
          purchaseRatePerGram: rateNum,
          makingCharges: makingNum,
          gstPercentage: 3.0,
          gstAmount: costBreakdown.gstAmount,
          totalCost: costBreakdown.totalCost,
          breakEvenRate,
          custodyLocation: location.trim() || 'Home Safe',
          huidCode: huidCode.trim() || undefined,
          invoicePhotoUri: invoicePhotoUri || undefined,
        });
      } else {
        await insertHolding({
          metalType,
          title: itemTitle,
          purityKarat,
          purityPercentage: purityFactor,
          grossWeightGrams: weightGrams,
          pureWeightGrams: pureWeight,
          purchaseRatePerGram: rateNum,
          makingCharges: makingNum,
          gstPercentage: 3.0,
          gstAmount: costBreakdown.gstAmount,
          totalCost: costBreakdown.totalCost,
          breakEvenRate,
          custodyLocation: location.trim() || 'Home Safe',
          huidCode: huidCode.trim() || undefined,
          invoicePhotoUri: invoicePhotoUri || undefined,
          purchaseDate: new Date().toISOString().split('T')[0],
        });
      }

      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      await refreshHoldings();
      router.back();
    } catch (e) {
      console.error('Failed to save holding:', e);
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.elevated} />

      {/* Top Modal Header */}
      <View style={styles.modalHeader}>
        <View style={styles.handleBar} />
        <View style={styles.titleRow}>
          <Text style={styles.modalTitle}>
            {isEditing ? 'Edit Bullion Entry' : 'Add Bullion Entry'}
          </Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <X size={18} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Metal Switcher */}
        <MetalSwitcher selected={metalType} onSelect={handleMetalChange} />

        {/* Purity Grade Selector */}
        <PurityChips
          metalType={metalType}
          selectedPurity={purityKarat}
          onSelectPurity={setPurityKarat}
        />

        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ITEM NAME (OPTIONAL)</Text>
          <TextInput
            style={styles.textInput}
            placeholder={
              metalType === 'GOLD'
                ? 'e.g. 10g Kundan 24K Gold Bar'
                : 'e.g. 1 kg MMTC-PAMP Silver Bar'
            }
            placeholderTextColor={colors.text.tertiary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Allocated Weight Stepper */}
        <View style={styles.inputGroup}>
          <View style={styles.labelBetweenRow}>
            <Text style={styles.inputLabel}>ALLOCATED WEIGHT (GRAMS)</Text>
            <Text style={styles.pureWeightHint}>
              Pure: {pureWeight}g ({purityKarat})
            </Text>
          </View>
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => adjustWeight(-1)}
              activeOpacity={0.7}
            >
              <Minus size={18} color={colors.text.primary} />
            </TouchableOpacity>

            <Text style={styles.stepperValue}>{weightGrams.toFixed(2)} g</Text>

            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => adjustWeight(1)}
              activeOpacity={0.7}
            >
              <Plus size={18} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Quick Add Pills */}
          <View style={styles.quickAddRow}>
            {[1, 5, 10, 50, 100].map((qty) => (
              <TouchableOpacity
                key={qty}
                style={styles.quickAddChip}
                onPress={() => setWeightGrams(qty)}
              >
                <Text style={styles.quickAddText}>+{qty}g</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Two-Column Financial Inputs */}
        <View style={styles.twoColRow}>
          <View style={styles.colItem}>
            <Text style={styles.inputLabel}>RATE (₹ / GRAM)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={purchaseRate}
              onChangeText={setPurchaseRate}
            />
          </View>

          <View style={styles.colItem}>
            <Text style={styles.inputLabel}>MAKING CHARGES (₹)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={makingCharges}
              onChangeText={setMakingCharges}
            />
          </View>
        </View>

        {/* Custody Depository & HUID */}
        <View style={styles.twoColRow}>
          <View style={styles.colItem}>
            <Text style={styles.inputLabel}>STORAGE LOCATION</Text>
            <TextInput
              style={styles.textInput}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Bank Locker #402"
              placeholderTextColor={colors.text.tertiary}
            />
          </View>

          <View style={styles.colItem}>
            <Text style={styles.inputLabel}>HALLMARK HUID</Text>
            <TextInput
              style={styles.textInput}
              value={huidCode}
              onChangeText={setHuidCode}
              placeholder="e.g. AB9482"
              placeholderTextColor={colors.text.tertiary}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* Bill / Receipt Photo (Optional) Upload Box */}
        <BillUploadBox
          imageUri={invoicePhotoUri}
          onImageSelected={setInvoicePhotoUri}
        />

        {/* Real-time Cost Breakdown Box */}
        <View style={styles.costBox}>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Base Metal Outlay:</Text>
            <Text style={styles.costVal}>
              ₹{costBreakdown.baseCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Making & Crafting:</Text>
            <Text style={styles.costVal}>
              +₹{makingNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Statutory GST (3%):</Text>
            <Text style={styles.costVal}>
              +₹{costBreakdown.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.costDivider} />

          <View style={styles.costRow}>
            <Text style={styles.totalLabel}>TOTAL ACQUISITION COST:</Text>
            <Text style={styles.totalVal}>
              ₹{costBreakdown.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.breakEvenPill}>
            <Text style={styles.breakEvenLabel}>BREAK-EVEN SPOT RATE:</Text>
            <Text style={styles.breakEvenVal}>
              ₹{breakEvenRate.toLocaleString('en-IN')}/g
            </Text>
          </View>
        </View>

        {/* Primary Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSubmitting && styles.disabledBtn]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          <Lock size={16} color={colors.canvas} />
          <Text style={styles.saveButtonText}>
            {isSubmitting
              ? isEditing
                ? 'Updating Vault Entry...'
                : 'Saving to Vault...'
              : isEditing
              ? 'Update Vault Entry'
              : 'Save to Vault'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.elevated,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    alignItems: 'center',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.active,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  modalTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelBetweenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  pureWeightHint: {
    color: colors.gold.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  textInput: {
    height: 44,
    backgroundColor: colors.input,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: 12,
    color: colors.text.primary,
    fontSize: 14,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.input,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 6,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  quickAddChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  quickAddText: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  colItem: {
    flex: 1,
  },
  costBox: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 14,
    marginVertical: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  costLabel: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  costVal: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  costDivider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: 8,
  },
  totalLabel: {
    color: colors.gold.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  totalVal: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  breakEvenPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border.interactive,
  },
  breakEvenLabel: {
    color: colors.text.tertiary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  breakEvenVal: {
    color: colors.gold.pale,
    fontSize: 13,
    fontWeight: '700',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.gold.primary,
    marginTop: 6,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.canvas,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
