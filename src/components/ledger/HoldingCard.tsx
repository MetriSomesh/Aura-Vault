import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Building2,
  ShieldCheck,
} from 'lucide-react-native';
import { Holding } from '../../types/bullion';
import { colors } from '../../theme/colors';
import { calculateHoldingValuation, calculatePnl } from '../../utils/calculations';
import { useVaultStore } from '../../store/useVaultStore';

interface HoldingCardProps {
  item: Holding;
  onDelete: (id: string) => void;
}

export function HoldingCard({ item, onDelete }: HoldingCardProps) {
  const router = useRouter();
  const { spotRate, isGhostMode } = useVaultStore();

  const isGold = item.metalType === 'GOLD';
  const valuation = calculateHoldingValuation(
    item,
    spotRate.gold24kPerGram,
    spotRate.silver999PerGram
  );
  const pnl = calculatePnl(valuation, item.totalCost);

  return (
    <View style={[styles.card, isGold ? styles.goldCardBorder : styles.silverCardBorder]}>
      {/* Top Row: Title, Purity Badge & Quick Actions */}
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <View
            style={[
              styles.purityBadge,
              isGold ? styles.goldPurityBadge : styles.silverPurityBadge,
            ]}
          >
            <Text
              style={[
                styles.purityText,
                isGold ? styles.goldPurityText : styles.silverPurityText,
              ]}
            >
              {item.purityKarat} • {isGold ? '99.9%' : 'Fine'}
            </Text>
          </View>
          <Text style={styles.titleText} numberOfLines={1}>
            {item.title}
          </Text>
        </View>

        {/* Quick Edit and Delete buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push(`/entry/${item.id}`)}
            activeOpacity={0.7}
          >
            <Pencil size={13} color={colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => onDelete(item.id)}
            activeOpacity={0.7}
          >
            <Trash2 size={13} color={colors.loss.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Metrics Row: Current Value vs Bought At */}
      <View style={styles.financialRow}>
        <View>
          <Text style={styles.metricLabel}>CURRENT VALUATION</Text>
          <Text style={styles.valuationValue}>
            {isGhostMode
              ? '₹ ••••••'
              : `₹${valuation.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}`}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.metricLabel}>BOUGHT AT</Text>
          <Text style={styles.boughtValue}>
            {isGhostMode
              ? '₹ ••••••'
              : `₹${item.totalCost.toLocaleString('en-IN')}`}
          </Text>
        </View>
      </View>

      {/* P&L Badge & Date Row */}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.pnlPill,
            pnl.isProfit ? styles.pnlProfit : styles.pnlLoss,
          ]}
        >
          {pnl.isProfit ? (
            <TrendingUp size={11} color={colors.profit.text} />
          ) : (
            <TrendingDown size={11} color={colors.loss.text} />
          )}
          <Text
            style={[
              styles.pnlPillText,
              pnl.isProfit ? styles.pnlProfitText : styles.pnlLossText,
            ]}
          >
            {isGhostMode
              ? '••••'
              : `${pnl.isProfit ? '+' : ''}₹${Math.abs(pnl.amount).toLocaleString(
                  'en-IN'
                )} (${pnl.percentage}%)`}
          </Text>
        </View>

        <Text style={styles.dateText}>Acquired {item.purchaseDate}</Text>
      </View>

      {/* Metadata Tags Row: Break-Even Rate, Locker, HUID */}
      <View style={styles.tagsContainer}>
        {/* Break-Even Spot Rate Badge */}
        <View style={styles.metaChip}>
          <Text style={styles.metaChipGoldText}>
            Break-Even: ₹{item.breakEvenRate.toLocaleString('en-IN')}/g
          </Text>
        </View>

        {/* Locker Location */}
        <View style={styles.metaChip}>
          <Building2 size={10} color={colors.text.tertiary} />
          <Text style={styles.metaChipText}>{item.custodyLocation}</Text>
        </View>

        {/* HUID Badge if exists */}
        {item.huidCode && (
          <View style={styles.metaChip}>
            <ShieldCheck size={10} color={colors.gold.primary} />
            <Text style={styles.metaChipText}>HUID: {item.huidCode}</Text>
          </View>
        )}
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
    padding: 14,
    marginBottom: 10,
  },
  goldCardBorder: {
    borderLeftWidth: 2.5,
    borderLeftColor: colors.gold.primary,
  },
  silverCardBorder: {
    borderLeftWidth: 2.5,
    borderLeftColor: colors.silver.primary,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  purityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 1,
  },
  goldPurityBadge: {
    backgroundColor: colors.gold.muted,
    borderColor: colors.gold.primary,
  },
  silverPurityBadge: {
    backgroundColor: colors.silver.muted,
    borderColor: colors.silver.primary,
  },
  purityText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  goldPurityText: {
    color: colors.gold.primary,
  },
  silverPurityText: {
    color: colors.silver.primary,
  },
  titleText: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  metricLabel: {
    color: colors.text.tertiary,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  valuationValue: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  boughtValue: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pnlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  pnlProfit: {
    backgroundColor: colors.profit.bg,
  },
  pnlLoss: {
    backgroundColor: colors.loss.bg,
  },
  pnlPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pnlProfitText: {
    color: colors.profit.text,
  },
  pnlLossText: {
    color: colors.loss.text,
  },
  dateText: {
    color: colors.text.tertiary,
    fontSize: 11,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.canvas,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  metaChipText: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: '500',
  },
  metaChipGoldText: {
    color: colors.gold.pale,
    fontSize: 10,
    fontWeight: '600',
  },
});
