import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowUpRight, ArrowDownRight, ShieldAlert } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useVaultStore } from '../../store/useVaultStore';

export function PortfolioHero() {
  const { portfolio, isGhostMode } = useVaultStore();

  const isProfit = portfolio.totalPnlAmount >= 0;

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>TOTAL NET WORTH</Text>
        {isGhostMode && (
          <View style={styles.ghostBadge}>
            <Text style={styles.ghostBadgeText}>HIDDEN</Text>
          </View>
        )}
      </View>

      {/* Main Net Worth Value */}
      <Text style={styles.netWorthText}>
        {isGhostMode
          ? '₹ ••••••••'
          : `₹${portfolio.totalNetWorth.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}`}
      </Text>

      {/* Sub-Metrics Flex Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>INVESTED</Text>
          <Text style={styles.metricValue}>
            {isGhostMode
              ? '₹ ••••••'
              : `₹${portfolio.totalInvested.toLocaleString('en-IN')}`}
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>TOTAL P&L</Text>
          <View
            style={[
              styles.pnlBadge,
              isProfit ? styles.pnlProfitBadge : styles.pnlLossBadge,
            ]}
          >
            {isProfit ? (
              <ArrowUpRight size={12} color={colors.profit.text} />
            ) : (
              <ArrowDownRight size={12} color={colors.loss.text} />
            )}
            <Text
              style={[
                styles.pnlText,
                isProfit ? styles.pnlProfitText : styles.pnlLossText,
              ]}
            >
              {isGhostMode
                ? '••••'
                : `${isProfit ? '+' : ''}₹${Math.abs(
                    portfolio.totalPnlAmount
                  ).toLocaleString('en-IN')} (${portfolio.totalPnlPercentage}%)`}
            </Text>
          </View>
        </View>
      </View>

      {/* Asset Allocation Progress Bar */}
      <View style={styles.allocationContainer}>
        <View style={styles.allocationHeader}>
          <Text style={styles.allocationTitle}>ASSET ALLOCATION</Text>
          <Text style={styles.allocationSubTitle}>
            {portfolio.totalGoldGrams}g Gold • {portfolio.totalSilverGrams}g Silver
          </Text>
        </View>

        {/* Dual-color bar */}
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressGoldSegment,
              { width: `${portfolio.goldAllocationPercent}%` },
            ]}
          />
          <View
            style={[
              styles.progressSilverSegment,
              { width: `${portfolio.silverAllocationPercent}%` },
            ]}
          />
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.gold.primary }]} />
            <Text style={styles.legendText}>
              Gold ({portfolio.goldAllocationPercent}%)
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.silver.primary }]} />
            <Text style={styles.legendText}>
              Silver ({portfolio.silverAllocationPercent}%)
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 16,
    marginVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerLabel: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  ghostBadge: {
    backgroundColor: colors.border.subtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ghostBadgeText: {
    color: colors.text.tertiary,
    fontSize: 9,
    fontWeight: '600',
  },
  netWorthText: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.elevated,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 12,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border.subtle,
    marginHorizontal: 12,
  },
  metricLabel: {
    color: colors.text.tertiary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metricValue: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  pnlBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  pnlProfitBadge: {
    backgroundColor: colors.profit.bg,
  },
  pnlLossBadge: {
    backgroundColor: colors.loss.bg,
  },
  pnlText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pnlProfitText: {
    color: colors.profit.text,
  },
  pnlLossText: {
    color: colors.loss.text,
  },

  // Allocation
  allocationContainer: {
    paddingTop: 4,
  },
  allocationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  allocationTitle: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  allocationSubTitle: {
    color: colors.text.tertiary,
    fontSize: 10,
  },
  progressBarBackground: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.canvas,
    overflow: 'hidden',
  },
  progressGoldSegment: {
    height: '100%',
    backgroundColor: colors.gold.primary,
  },
  progressSilverSegment: {
    height: '100%',
    backgroundColor: colors.silver.primary,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    color: colors.text.secondary,
    fontSize: 11,
  },
});
