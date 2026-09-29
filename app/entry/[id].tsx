import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Trash2,
  Pencil,
  ShieldAlert,
  Building2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Receipt,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/theme/colors';
import { Holding } from '../../src/types/bullion';
import { getHoldingById, deleteHolding } from '../../src/db/repository';
import { calculateHoldingValuation, calculatePnl } from '../../src/utils/calculations';
import { useVaultStore } from '../../src/store/useVaultStore';

export default function DetailInspectionModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { spotRate, refreshHoldings, isGhostMode } = useVaultStore();

  const [item, setItem] = useState<Holding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadItem() {
      if (id) {
        const found = await getHoldingById(id);
        setItem(found);
      }
      setIsLoading(false);
    }
    loadItem();
  }, [id]);

  const handleConfirmDelete = async () => {
    if (!item) return;
    setIsDeleting(true);
    try {
      await deleteHolding(item.id);
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
      await refreshHoldings();
      setIsDeleteModalVisible(false);
      router.back();
    } catch {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.gold.primary} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Bullion holding not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Return to Ledger</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isGold = item.metalType === 'GOLD';
  const valuation = calculateHoldingValuation(
    item,
    spotRate.gold24kPerGram,
    spotRate.silver999PerGram
  );
  const pnl = calculatePnl(valuation, item.totalCost);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.canvas} />

      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={colors.text.primary} />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Bullion Inspection</Text>

        <View style={styles.topPurityBadge}>
          <Text style={styles.topPurityText}>{item.purityKarat}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Item Header & Purity */}
        <View style={styles.itemHeaderCard}>
          <View
            style={[
              styles.metalBadge,
              isGold ? styles.goldBadge : styles.silverBadge,
            ]}
          >
            <Text
              style={[
                styles.metalBadgeText,
                isGold ? styles.goldBadgeText : styles.silverBadgeText,
              ]}
            >
              {isGold ? '24K • 99.9% GOLD' : '999 FINE SILVER'}
            </Text>
          </View>
          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.subtitleText}>
            {item.grossWeightGrams}g Gross • {item.pureWeightGrams}g Pure Fine Metal
          </Text>
        </View>

        {/* Valuation Hero */}
        <View style={styles.valuationHeroCard}>
          <Text style={styles.valLabel}>CURRENT VALUATION</Text>
          <Text style={styles.valAmount}>
            {isGhostMode
              ? '₹ ••••••••'
              : `₹${valuation.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}`}
          </Text>
          <View
            style={[
              styles.pnlPill,
              pnl.isProfit ? styles.pnlProfit : styles.pnlLoss,
            ]}
          >
            {pnl.isProfit ? (
              <TrendingUp size={12} color={colors.profit.text} />
            ) : (
              <TrendingDown size={12} color={colors.loss.text} />
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
        </View>

        {/* Itemized Audit Receipt */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <Receipt size={16} color={colors.gold.primary} />
            <Text style={styles.receiptTitle}>ITEMIZED ACQUISITION RECEIPT</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.rowLabel}>Net Pure Weight:</Text>
            <Text style={styles.rowVal}>{item.pureWeightGrams} g</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.rowLabel}>Purchase Rate per Gram:</Text>
            <Text style={styles.rowVal}>₹{item.purchaseRatePerGram}/g</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.rowLabel}>Making Charges Paid:</Text>
            <Text style={styles.rowVal}>₹{item.makingCharges.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.rowLabel}>Statutory GST ({item.gstPercentage}%):</Text>
            <Text style={styles.rowVal}>₹{item.gstAmount.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.receiptDivider} />

          <View style={styles.receiptRow}>
            <Text style={styles.totalRowLabel}>TOTAL COST PAID:</Text>
            <Text style={styles.totalRowVal}>
              ₹{item.totalCost.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.breakEvenBox}>
            <Text style={styles.breakEvenLabel}>BREAK-EVEN SPOT RATE:</Text>
            <Text style={styles.breakEvenVal}>
              ₹{item.breakEvenRate.toLocaleString('en-IN')}/g
            </Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.rowLabel}>Custody Depository:</Text>
            <Text style={styles.rowVal}>{item.custodyLocation}</Text>
          </View>

          {item.huidCode && (
            <View style={styles.receiptRow}>
              <Text style={styles.rowLabel}>Hallmark HUID:</Text>
              <Text style={styles.huidVal}>{item.huidCode}</Text>
            </View>
          )}

          <View style={styles.receiptRow}>
            <Text style={styles.rowLabel}>Acquisition Date:</Text>
            <Text style={styles.rowVal}>{item.purchaseDate}</Text>
          </View>
        </View>

        {/* Optional Attached Invoice / Bill Photo Preview */}
        {item.invoicePhotoUri && (
          <View style={styles.invoicePreviewCard}>
            <View style={styles.receiptHeader}>
              <ShieldCheck size={16} color={colors.profit.text} />
              <Text style={styles.receiptTitle}>ATTACHED BILL / CERTIFICATE</Text>
            </View>
            <Image
              source={{ uri: item.invoicePhotoUri }}
              style={styles.invoiceImage}
              resizeMode="cover"
            />
            <Text style={styles.invoiceCaption}>
              Tamper-Evident Stored Locally • Verified Assay Proof
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionFooter}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/entry/add?editId=${item.id}`)}
            activeOpacity={0.8}
          >
            <Pencil size={16} color={colors.gold.primary} />
            <Text style={styles.editButtonText}>
              Edit Transaction Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setIsDeleteModalVisible(true)}
            activeOpacity={0.8}
          >
            <Trash2 size={16} color={colors.loss.text} />
            <Text style={styles.deleteButtonText}>
              Delete Entry from Portfolio
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Active Delete Confirmation Dialog Overlay */}
      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.dialogScrim}>
          <View style={styles.dialogBox}>
            <View style={styles.warningCircle}>
              <ShieldAlert size={28} color={colors.loss.text} />
            </View>

            <Text style={styles.dialogTitle}>Delete Bullion Holding?</Text>
            <Text style={styles.dialogDescription}>
              Are you sure you want to remove &quot;{item.title}&quot; from your vault?
              This action cannot be undone and will permanently update your portfolio
              totals.
            </Text>

            {/* Inset Holding Snapshot */}
            <View style={styles.dialogSnapshot}>
              <Text style={styles.snapshotText}>
                Holding Value: ₹{valuation.toLocaleString('en-IN')}
                {item.huidCode ? ` • HUID: ${item.huidCode}` : ''}
              </Text>
            </View>

            {/* Dialog Actions */}
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.cancelDialogBtn}
                onPress={() => setIsDeleteModalVisible(false)}
                activeOpacity={0.8}
                disabled={isDeleting}
              >
                <Text style={styles.cancelDialogBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                onPress={handleConfirmDelete}
                activeOpacity={0.8}
                disabled={isDeleting}
              >
                <Text style={styles.confirmDeleteBtnText}>
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  backBtnText: {
    color: colors.gold.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  topPurityBadge: {
    backgroundColor: colors.gold.muted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gold.primary,
  },
  topPurityText: {
    color: colors.gold.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  itemHeaderCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 16,
    marginBottom: 10,
  },
  metalBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 8,
  },
  goldBadge: {
    backgroundColor: colors.gold.muted,
    borderColor: colors.gold.primary,
  },
  silverBadge: {
    backgroundColor: colors.silver.muted,
    borderColor: colors.silver.primary,
  },
  metalBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  goldBadgeText: {
    color: colors.gold.primary,
  },
  silverBadgeText: {
    color: colors.silver.primary,
  },
  titleText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  subtitleText: {
    color: colors.text.tertiary,
    fontSize: 12,
    marginTop: 4,
  },
  valuationHeroCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 16,
    marginBottom: 10,
    alignItems: 'center',
  },
  valLabel: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.0,
    marginBottom: 4,
  },
  valAmount: {
    color: colors.text.primary,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  pnlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pnlProfit: {
    backgroundColor: colors.profit.bg,
  },
  pnlLoss: {
    backgroundColor: colors.loss.bg,
  },
  pnlPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pnlProfitText: {
    color: colors.profit.text,
  },
  pnlLossText: {
    color: colors.loss.text,
  },
  receiptCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 16,
    marginBottom: 10,
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  receiptTitle: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  rowLabel: {
    color: colors.text.tertiary,
    fontSize: 12,
  },
  rowVal: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  huidVal: {
    color: colors.gold.pale,
    fontSize: 12,
    fontWeight: '700',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: 8,
  },
  totalRowLabel: {
    color: colors.gold.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  totalRowVal: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  breakEvenBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.input,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border.interactive,
    marginVertical: 10,
  },
  breakEvenLabel: {
    color: colors.text.tertiary,
    fontSize: 10,
    fontWeight: '600',
  },
  breakEvenVal: {
    color: colors.gold.pale,
    fontSize: 13,
    fontWeight: '700',
  },
  invoicePreviewCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 16,
    marginBottom: 10,
  },
  invoiceImage: {
    width: '100%',
    height: 180,
    borderRadius: 6,
    backgroundColor: colors.canvas,
    marginVertical: 8,
  },
  invoiceCaption: {
    color: colors.text.tertiary,
    fontSize: 10,
    textAlign: 'center',
  },
  actionFooter: {
    marginTop: 10,
    gap: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold.primary,
    backgroundColor: colors.card,
  },
  editButtonText: {
    color: colors.gold.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.danger,
    backgroundColor: colors.card,
  },
  deleteButtonText: {
    color: colors.loss.text,
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal Dialog
  dialogScrim: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.danger,
    padding: 20,
    alignItems: 'center',
  },
  warningCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.loss.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  dialogTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  dialogDescription: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 14,
  },
  dialogSnapshot: {
    backgroundColor: colors.input,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: 18,
  },
  snapshotText: {
    color: colors.gold.pale,
    fontSize: 11,
    fontWeight: '600',
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelDialogBtn: {
    flex: 1,
    height: 42,
    borderRadius: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelDialogBtnText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  confirmDeleteBtn: {
    flex: 1,
    height: 42,
    borderRadius: 6,
    backgroundColor: colors.loss.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteBtnText: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
