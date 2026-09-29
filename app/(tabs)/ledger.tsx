import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Search, X, Plus, Filter, Coins } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { useVaultStore } from '../../src/store/useVaultStore';
import { HoldingCard } from '../../src/components/ledger/HoldingCard';
import { deleteHolding } from '../../src/db/repository';

type FilterType = 'ALL' | 'GOLD' | 'SILVER' | 'LOCKER';

export default function LedgerScreen() {
  const router = useRouter();
  const { holdings, portfolio, isGhostMode, refreshHoldings } = useVaultStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  const handleDeleteItem = async (id: string) => {
    await deleteHolding(id);
    await refreshHoldings();
  };

  // Counts
  const goldCount = holdings.filter((h) => h.metalType === 'GOLD').length;
  const silverCount = holdings.filter((h) => h.metalType === 'SILVER').length;

  // Filter & Search Logic
  const filteredHoldings = holdings.filter((item) => {
    // Metal filter
    if (activeFilter === 'GOLD' && item.metalType !== 'GOLD') return false;
    if (activeFilter === 'SILVER' && item.metalType !== 'SILVER') return false;

    // Search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchLocation = item.custodyLocation.toLowerCase().includes(q);
      const matchHuid = item.huidCode?.toLowerCase().includes(q) ?? false;
      const matchPurity = item.purityKarat.toLowerCase().includes(q);
      return matchTitle || matchLocation || matchHuid || matchPurity;
    }

    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.canvas} />

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>HOLDINGS LEDGER</Text>
          <Text style={styles.headerTally}>
            {holdings.length} Assets •{' '}
            {isGhostMode
              ? '₹ ••••••••'
              : `₹${portfolio.totalNetWorth.toLocaleString('en-IN')} Total`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.filterIconBtn}
          onPress={() =>
            setActiveFilter((prev) => (prev === 'LOCKER' ? 'ALL' : 'LOCKER'))
          }
          activeOpacity={0.7}
        >
          <Filter
            size={16}
            color={
              activeFilter === 'LOCKER'
                ? colors.gold.primary
                : colors.text.secondary
            }
          />
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <Search size={16} color={colors.text.tertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search metals, lockers, or HUID..."
          placeholderTextColor={colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={16} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips Bar */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'ALL' && styles.activeFilterChip]}
          onPress={() => setActiveFilter('ALL')}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'ALL' && styles.activeFilterChipText,
            ]}
          >
            All ({holdings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'GOLD' && styles.activeFilterChip]}
          onPress={() => setActiveFilter('GOLD')}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'GOLD' && styles.activeFilterChipText,
            ]}
          >
            Gold ({goldCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            activeFilter === 'SILVER' && styles.activeFilterChip,
          ]}
          onPress={() => setActiveFilter('SILVER')}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'SILVER' && styles.activeFilterChipText,
            ]}
          >
            Silver ({silverCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            activeFilter === 'LOCKER' && styles.activeFilterChip,
          ]}
          onPress={() => setActiveFilter('LOCKER')}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'LOCKER' && styles.activeFilterChipText,
            ]}
          >
            By Locker
          </Text>
        </TouchableOpacity>
      </View>

      {/* Holdings List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredHoldings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Coins size={36} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No matching holdings found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search query or filter tags.
            </Text>
          </View>
        ) : (
          filteredHoldings.map((item) => (
            <HoldingCard
              key={item.id}
              item={item}
              onDelete={handleDeleteItem}
            />
          ))
        )}
      </ScrollView>

      {/* FAB to Add Bullion Holding */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  headerTally: {
    color: colors.gold.pale,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  filterIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  activeFilterChip: {
    backgroundColor: colors.gold.muted,
    borderColor: colors.gold.primary,
  },
  filterChipText: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  activeFilterChipText: {
    color: colors.gold.primary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 32,
    marginTop: 24,
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
    marginTop: 4,
    textAlign: 'center',
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
