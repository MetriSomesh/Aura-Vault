import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Coins,
  Scale,
  ShieldCheck,
  Percent,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/theme/colors';
import { useVaultStore } from '../../src/store/useVaultStore';

export default function SpotScreen() {
  const { spotRate, refreshSpotRates } = useVaultStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSpotRates();
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    } finally {
      setIsRefreshing(false);
    }
  };

  const gold24k = spotRate.gold24kPerGram;
  const gold22k = Math.round(gold24k * 0.916);
  const gold18k = Math.round(gold24k * 0.75);

  const silver999 = spotRate.silver999PerGram;
  const silver925 = Number((silver999 * 0.925).toFixed(2));

  const goldSilverRatio = silver999 > 0 ? (gold24k / silver999).toFixed(1) : '82.0';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.canvas} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarTitle}>Spot Bullion Market</Text>
          <Text style={styles.topBarSubtitle}>Live Global Feeds • 1g Standard</Text>
        </View>

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={handleRefresh}
          disabled={isRefreshing}
          activeOpacity={0.7}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color={colors.gold.primary} />
          ) : (
            <RefreshCw size={16} color={colors.gold.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* GOLD SPOT CARD */}
        <View style={[styles.marketCard, styles.goldCardBorder]}>
          <View style={styles.cardHeader}>
            <View style={styles.metalHeaderLeft}>
              <View style={styles.goldDot} />
              <Text style={styles.cardMetalTitle}>GOLD (XAU / INR)</Text>
            </View>
            <View
              style={[
                styles.changeChip,
                spotRate.gold24hChangePercent >= 0 ? styles.profitChip : styles.lossChip,
              ]}
            >
              {spotRate.gold24hChangePercent >= 0 ? (
                <TrendingUp size={11} color={colors.profit.text} />
              ) : (
                <TrendingDown size={11} color={colors.loss.text} />
              )}
              <Text
                style={[
                  styles.changeChipText,
                  spotRate.gold24hChangePercent >= 0
                    ? styles.profitChipText
                    : styles.lossChipText,
                ]}
              >
                {spotRate.gold24hChangePercent >= 0 ? '+' : ''}
                {spotRate.gold24hChangePercent}% (24h)
              </Text>
            </View>
          </View>

          {/* Primary 24K Rate */}
          <View style={styles.primaryRateBox}>
            <View>
              <Text style={styles.purityLabel}>24K FINE GOLD (99.9% PURE)</Text>
              <Text style={styles.primaryRateValue}>
                ₹{gold24k.toLocaleString('en-IN')}{' '}
                <Text style={styles.perUnitText}>/ 1g</Text>
              </Text>
            </View>
            <View style={styles.tenGramBadge}>
              <Text style={styles.tenGramLabel}>10 GRAMS</Text>
              <Text style={styles.tenGramValue}>
                ₹{(gold24k * 10).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Secondary Purities Grid */}
          <View style={styles.secondaryPurityGrid}>
            <View style={styles.purityItem}>
              <Text style={styles.subPurityTitle}>22K JEWELRY (91.6%)</Text>
              <Text style={styles.subPurityValue}>
                ₹{gold22k.toLocaleString('en-IN')}/g
              </Text>
              <Text style={styles.subPurityTen}>
                10g: ₹{(gold22k * 10).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.purityItem}>
              <Text style={styles.subPurityTitle}>18K SOVEREIGN (75.0%)</Text>
              <Text style={styles.subPurityValue}>
                ₹{gold18k.toLocaleString('en-IN')}/g
              </Text>
              <Text style={styles.subPurityTen}>
                10g: ₹{(gold18k * 10).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

        {/* SILVER SPOT CARD */}
        <View style={[styles.marketCard, styles.silverCardBorder]}>
          <View style={styles.cardHeader}>
            <View style={styles.metalHeaderLeft}>
              <View style={styles.silverDot} />
              <Text style={styles.cardMetalTitle}>SILVER (XAG / INR)</Text>
            </View>
            <View
              style={[
                styles.changeChip,
                spotRate.silver24hChangePercent >= 0
                  ? styles.profitChip
                  : styles.lossChip,
              ]}
            >
              {spotRate.silver24hChangePercent >= 0 ? (
                <TrendingUp size={11} color={colors.profit.text} />
              ) : (
                <TrendingDown size={11} color={colors.loss.text} />
              )}
              <Text
                style={[
                  styles.changeChipText,
                  spotRate.silver24hChangePercent >= 0
                    ? styles.profitChipText
                    : styles.lossChipText,
                ]}
              >
                {spotRate.silver24hChangePercent >= 0 ? '+' : ''}
                {spotRate.silver24hChangePercent}% (24h)
              </Text>
            </View>
          </View>

          {/* Primary 999 Rate */}
          <View style={styles.primaryRateBox}>
            <View>
              <Text style={styles.purityLabel}>999 FINE SILVER</Text>
              <Text style={styles.primaryRateValue}>
                ₹{silver999.toFixed(2)}{' '}
                <Text style={styles.perUnitText}>/ 1g</Text>
              </Text>
            </View>
            <View style={styles.tenGramBadge}>
              <Text style={styles.tenGramLabel}>1 KILOGRAM</Text>
              <Text style={styles.tenGramValue}>
                ₹{Math.round(silver999 * 1000).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Secondary Purities Grid */}
          <View style={styles.secondaryPurityGrid}>
            <View style={styles.purityItem}>
              <Text style={styles.subPurityTitle}>925 STERLING (92.5%)</Text>
              <Text style={styles.subPurityValue}>
                ₹{silver925.toFixed(2)}/g
              </Text>
              <Text style={styles.subPurityTen}>
                1kg: ₹{Math.round(silver925 * 1000).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.purityItem}>
              <Text style={styles.subPurityTitle}>100 GRAM BAR (999)</Text>
              <Text style={styles.subPurityValue}>
                ₹{Math.round(silver999 * 100).toLocaleString('en-IN')}
              </Text>
              <Text style={styles.subPurityTen}>Pure Fine Silver</Text>
            </View>
          </View>
        </View>

        {/* MARKET RATIOS & STATUTORY NOTES */}
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsHeading}>MARKET INTELLIGENCE</Text>

          <View style={styles.analyticsRow}>
            <View style={styles.analyticsItem}>
              <View style={styles.analyticsIconRow}>
                <Scale size={14} color={colors.gold.primary} />
                <Text style={styles.analyticsLabel}>Gold / Silver Ratio</Text>
              </View>
              <Text style={styles.analyticsVal}>{goldSilverRatio} : 1</Text>
              <Text style={styles.analyticsDesc}>1g Gold buys {goldSilverRatio}g Silver</Text>
            </View>

            <View style={styles.analyticsItem}>
              <View style={styles.analyticsIconRow}>
                <Percent size={14} color={colors.text.secondary} />
                <Text style={styles.analyticsLabel}>Statutory GST</Text>
              </View>
              <Text style={styles.analyticsVal}>3.0%</Text>
              <Text style={styles.analyticsDesc}>Applied to metal + making</Text>
            </View>
          </View>

          <View style={styles.trustBanner}>
            <ShieldCheck size={14} color={colors.gold.primary} />
            <Text style={styles.trustBannerText}>
              All rates represent pure raw bullion spot benchmarks exclusive of jeweler premium.
            </Text>
          </View>
        </View>
      </ScrollView>
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
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  marketCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 16,
    marginBottom: 14,
  },
  goldCardBorder: {
    borderLeftWidth: 3,
    borderLeftColor: colors.gold.primary,
  },
  silverCardBorder: {
    borderLeftWidth: 3,
    borderLeftColor: colors.silver.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goldDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold.primary,
  },
  silverDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.silver.primary,
  },
  cardMetalTitle: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  changeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  profitChip: {
    backgroundColor: colors.profit.bg,
  },
  lossChip: {
    backgroundColor: colors.loss.bg,
  },
  changeChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  profitChipText: {
    color: colors.profit.text,
  },
  lossChipText: {
    color: colors.loss.text,
  },
  primaryRateBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.canvas,
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: 12,
  },
  purityLabel: {
    color: colors.text.tertiary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  primaryRateValue: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  perUnitText: {
    color: colors.text.tertiary,
    fontSize: 12,
    fontWeight: '500',
  },
  tenGramBadge: {
    alignItems: 'flex-end',
  },
  tenGramLabel: {
    color: colors.text.tertiary,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  tenGramValue: {
    color: colors.gold.pale,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryPurityGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  purityItem: {
    flex: 1,
    backgroundColor: colors.canvas,
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  subPurityTitle: {
    color: colors.text.secondary,
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 4,
  },
  subPurityValue: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  subPurityTen: {
    color: colors.text.tertiary,
    fontSize: 10,
  },
  analyticsCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 16,
  },
  analyticsHeading: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.0,
    marginBottom: 14,
  },
  analyticsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  analyticsItem: {
    flex: 1,
    backgroundColor: colors.canvas,
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  analyticsIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  analyticsLabel: {
    color: colors.text.tertiary,
    fontSize: 10,
    fontWeight: '600',
  },
  analyticsVal: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  analyticsDesc: {
    color: colors.text.secondary,
    fontSize: 10,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.input,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  trustBannerText: {
    flex: 1,
    color: colors.text.tertiary,
    fontSize: 10,
    lineHeight: 14,
  },
});
