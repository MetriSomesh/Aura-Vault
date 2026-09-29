import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useVaultStore } from '../../store/useVaultStore';

export function SpotTickerBar() {
  const { spotRate } = useVaultStore();

  const isGoldPositive = spotRate.gold24hChangePercent >= 0;
  const isSilverPositive = spotRate.silver24hChangePercent >= 0;

  return (
    <View style={styles.container}>
      {/* Gold 24K 1g Card */}
      <View style={[styles.card, styles.goldCard]}>
        <View style={styles.cardHeader}>
          <Text style={styles.metalLabel}>GOLD 24K (1g)</Text>
          <View style={styles.livePulseDot} />
        </View>
        <Text style={styles.priceText}>
          ₹{spotRate.gold24kPerGram.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Text>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.changeBadge,
              isGoldPositive ? styles.positiveBadge : styles.negativeBadge,
            ]}
          >
            {isGoldPositive ? (
              <TrendingUp size={10} color={colors.profit.text} />
            ) : (
              <TrendingDown size={10} color={colors.loss.text} />
            )}
            <Text
              style={[
                styles.changeText,
                isGoldPositive ? styles.positiveText : styles.negativeText,
              ]}
            >
              {isGoldPositive ? '+' : ''}
              {spotRate.gold24hChangePercent}%
            </Text>
          </View>
          <Text style={styles.subtleTime}>Live Spot</Text>
        </View>
      </View>

      {/* Silver 999 1g Card */}
      <View style={[styles.card, styles.silverCard]}>
        <View style={styles.cardHeader}>
          <Text style={styles.metalLabel}>SILVER 999 (1g)</Text>
          <View style={styles.livePulseDot} />
        </View>
        <Text style={styles.priceText}>
          ₹{spotRate.silver999PerGram.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Text>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.changeBadge,
              isSilverPositive ? styles.positiveBadge : styles.negativeBadge,
            ]}
          >
            {isSilverPositive ? (
              <TrendingUp size={10} color={colors.profit.text} />
            ) : (
              <TrendingDown size={10} color={colors.loss.text} />
            )}
            <Text
              style={[
                styles.changeText,
                isSilverPositive ? styles.positiveText : styles.negativeText,
              ]}
            >
              {isSilverPositive ? '+' : ''}
              {spotRate.silver24hChangePercent}%
            </Text>
          </View>
          <Text style={styles.subtleTime}>Live Spot</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 12,
  },
  goldCard: {
    borderLeftWidth: 2,
    borderLeftColor: colors.gold.primary,
  },
  silverCard: {
    borderLeftWidth: 2,
    borderLeftColor: colors.silver.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metalLabel: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.profit.text,
  },
  priceText: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  positiveBadge: {
    backgroundColor: colors.profit.bg,
  },
  negativeBadge: {
    backgroundColor: colors.loss.bg,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  positiveText: {
    color: colors.profit.text,
  },
  negativeText: {
    color: colors.loss.text,
  },
  subtleTime: {
    color: colors.text.tertiary,
    fontSize: 9,
  },
});
