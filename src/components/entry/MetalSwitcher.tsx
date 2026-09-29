import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MetalType } from '../../types/bullion';
import { colors } from '../../theme/colors';

interface MetalSwitcherProps {
  selected: MetalType;
  onSelect: (metal: MetalType) => void;
}

export function MetalSwitcher({ selected, onSelect }: MetalSwitcherProps) {
  const isGold = selected === 'GOLD';
  const isSilver = selected === 'SILVER';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isGold && styles.goldSelectedButton]}
        onPress={() => onSelect('GOLD')}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, isGold && styles.goldSelectedText]}>
          ✨ Gold Bullion
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isSilver && styles.silverSelectedButton]}
        onPress={() => onSelect('SILVER')}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, isSilver && styles.silverSelectedText]}>
          🥈 Silver Bullion
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: 14,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  goldSelectedButton: {
    backgroundColor: colors.gold.muted,
    borderWidth: 1,
    borderColor: colors.gold.primary,
  },
  silverSelectedButton: {
    backgroundColor: colors.silver.muted,
    borderWidth: 1,
    borderColor: colors.silver.primary,
  },
  buttonText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  goldSelectedText: {
    color: colors.gold.primary,
  },
  silverSelectedText: {
    color: colors.silver.primary,
  },
});
