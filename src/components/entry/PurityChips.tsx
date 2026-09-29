import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MetalType, PurityGrade } from '../../types/bullion';
import { colors } from '../../theme/colors';

interface PurityChipsProps {
  metalType: MetalType;
  selectedPurity: PurityGrade;
  onSelectPurity: (purity: PurityGrade) => void;
}

const GOLD_PURITIES: { grade: PurityGrade; label: string }[] = [
  { grade: '24K', label: '24K (999.9)' },
  { grade: '22K', label: '22K (916)' },
  { grade: '18K', label: '18K (750)' },
];

const SILVER_PURITIES: { grade: PurityGrade; label: string }[] = [
  { grade: '999', label: '999 Fine Mint' },
  { grade: '925', label: '925 Sterling' },
];

export function PurityChips({
  metalType,
  selectedPurity,
  onSelectPurity,
}: PurityChipsProps) {
  const purities = metalType === 'GOLD' ? GOLD_PURITIES : SILVER_PURITIES;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>PURITY GRADE</Text>
      <View style={styles.chipsRow}>
        {purities.map((item) => {
          const isSelected = selectedPurity === item.grade;
          return (
            <TouchableOpacity
              key={item.grade}
              style={[
                styles.chip,
                isSelected && (metalType === 'GOLD' ? styles.goldChip : styles.silverChip),
              ]}
              onPress={() => onSelectPurity(item.grade)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected &&
                    (metalType === 'GOLD'
                      ? styles.goldChipText
                      : styles.silverChipText),
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldChip: {
    backgroundColor: colors.gold.muted,
    borderColor: colors.gold.primary,
  },
  silverChip: {
    backgroundColor: colors.silver.muted,
    borderColor: colors.silver.primary,
  },
  chipText: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  goldChipText: {
    color: colors.gold.primary,
  },
  silverChipText: {
    color: colors.silver.primary,
  },
});
