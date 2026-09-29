import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Shield,
  Eye,
  EyeOff,
  Bell,
  Plus,
  Pencil,
  Trash2,
  Coins,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { useVaultStore } from '../../src/store/useVaultStore';
import { SpotTickerBar } from '../../src/components/dashboard/SpotTickerBar';
import { PortfolioHero } from '../../src/components/dashboard/PortfolioHero';
import { ReturnsChart } from '../../src/components/dashboard/ReturnsChart';
import { deleteHolding } from '../../src/db/repository';

export default function DashboardScreen() {
  const router = useRouter();
  const {
    holdings,
    isGhostMode,
    toggleGhostMode,
    refreshHoldings,
    refreshSpotRates,
  } = useVaultStore();

  useEffect(() => {
    refreshHoldings();
    refreshSpotRates();
  }, [refreshHoldings, refreshSpotRates]);

  const handleDeleteItem = async (id: string) => {
    await deleteHolding(id);
    await refreshHoldings();
  };

  const previewHoldings = holdings.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.canvas} />

      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View style={styles.vaultIdentity}>
          <View style={styles.avatarCircle}>
            <Shield size={16} color={colors.gold.primary} />
          </View>
          <View>
            <Text style={styles.vaultTitle}>My Bullion Vault</Text>
            <Text style={styles.vaultSubtitle}>AURA VAULT RESERVE</Text>
          </View>
        </View>

        {/* Action icons */}
        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleGhostMode}
            activeOpacity={0.7}
          >
            {isGhostMode ? (
              <EyeOff size={18} color={colors.gold.primary} />
            ) : (
              <Eye size={18} color={colors.text.secondary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Bell size={18} color={colors.text.secondary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Live Spot Ticker Bar */}
        <SpotTickerBar />

        {/* Hero Portfolio Valuation Card */}
        <PortfolioHero />

        {/* Valuation Growth Line Chart */}
        <ReturnsChart />

        {/* Recent Holdings Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>RECENT HOLDINGS</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/ledger')}>
            <Text style={styles.viewLedgerLink}>View Ledger →</Text>
          </TouchableOpacity>
        </View>

        {previewHoldings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Coins size={36} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No bullion holdings added yet.</Text>
            <Text style={styles.emptySubtext}>
              Tap the (+) button below to log your first gold or silver bar.
            </Text>
          </View>
        ) : (
          previewHoldings.map((item) => {
            const isGold = item.metalType === 'GOLD';
            return (
              <View key={item.id} style={styles.holdingCard}>
                <View style={styles.holdingMainRow}>
                  <View
                    style={[
                      styles.metalTag,
                      isGold ? styles.goldTag : styles.silverTag,
                    ]}
                  >
                    <Text
                      style={[
                        styles.metalTagText,
                        isGold ? styles.goldTagText : styles.silverTagText,
                      ]}
                    >
                      {item.purityKarat}
                    </Text>
                  </View>

                  <View style={styles.holdingInfo}>
                    <Text style={styles.holdingTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.holdingSubtitle}>
                      {item.grossWeightGrams}g • {item.custodyLocation}
                    </Text>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => router.push(`/entry/${item.id}`)}
                    >
                      <Pencil size={14} color={colors.text.secondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 size={14} color={colors.loss.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Financial line */}
                <View style={styles.holdingFinancialRow}>
                  <View>
                    <Text style={styles.finLabel}>TOTAL COST</Text>
                    <Text style={styles.finValue}>
                      {isGhostMode
                        ? '••••••'
                        : `₹${item.totalCost.toLocaleString('en-IN')}`}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.finLabel}>BREAK-EVEN RATE</Text>
                    <Text style={styles.breakEvenText}>
                      ₹{item.breakEvenRate.toLocaleString('en-IN')}/g
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push('/entry/add')}
      >
        <Plus size={24} color={colors.canvas} strokeWidth={2.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  vaultIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border.interactive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  vaultSubtitle: {
    color: colors.gold.primary,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.0,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.0,
  },
  viewLedgerLink: {
    color: colors.gold.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 24,
    marginTop: 8,
  },
  emptyText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    color: colors.text.secondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  holdingCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 12,
    marginBottom: 8,
  },
  holdingMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metalTag: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  goldTag: {
    backgroundColor: colors.gold.muted,
    borderColor: colors.gold.primary,
  },
  silverTag: {
    backgroundColor: colors.silver.muted,
    borderColor: colors.silver.primary,
  },
  metalTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  goldTagText: {
    color: colors.gold.primary,
  },
  silverTagText: {
    color: colors.silver.primary,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingTitle: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  holdingSubtitle: {
    color: colors.text.tertiary,
    fontSize: 11,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdingFinancialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  finLabel: {
    color: colors.text.tertiary,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  finValue: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  breakEvenText: {
    color: colors.gold.pale,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.gold.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});
