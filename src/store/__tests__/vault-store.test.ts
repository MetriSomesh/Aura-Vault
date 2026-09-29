import { useVaultStore } from '../useVaultStore';
import { Holding } from '../../types/bullion';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ TEST FAILED: ${message}`);
  }
}

console.log('🧪 Starting Vault Store & Dashboard State Test Suite...\n');

// 1. Initial State
const state = useVaultStore.getState();
assert(state.isGhostMode === false, 'Ghost mode must initially be false');
assert(state.activeTimeframe === '1Y', 'Default timeframe must be 1Y');
assert(state.spotRate.gold24kPerGram === 7485.0, 'Default gold rate must be 7485');
console.log('✅ Passed: Initial dashboard state verified.');

// 2. Ghost Mode Toggle
useVaultStore.getState().toggleGhostMode();
assert(useVaultStore.getState().isGhostMode === true, 'Ghost mode must be true after toggle');
useVaultStore.getState().toggleGhostMode();
assert(useVaultStore.getState().isGhostMode === false, 'Ghost mode must be false after second toggle');
console.log('✅ Passed: Ghost Mode toggle verified.');

// 3. Timeframe selector
useVaultStore.getState().setTimeframe('5Y');
assert(useVaultStore.getState().activeTimeframe === '5Y', 'Timeframe must update to 5Y');
useVaultStore.getState().setTimeframe('1Y');
assert(useVaultStore.getState().activeTimeframe === '1Y', 'Timeframe must update back to 1Y');
console.log('✅ Passed: Timeframe selection verified.');

// 4. Holdings & Automatic Portfolio Recalculation
const testHoldingGold: Holding = {
  id: 'test_1',
  metalType: 'GOLD',
  title: '10g 24K Gold Bar',
  purityKarat: '24K',
  purityPercentage: 0.999,
  grossWeightGrams: 10.0,
  pureWeightGrams: 9.99,
  purchaseRatePerGram: 6850.0,
  makingCharges: 1200.0,
  gstPercentage: 3.0,
  gstAmount: 2091.0,
  totalCost: 71791.0,
  breakEvenRate: 7186.29,
  custodyLocation: 'HDFC Locker #402',
  purchaseDate: '2026-08-14',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const testHoldingSilver: Holding = {
  id: 'test_2',
  metalType: 'SILVER',
  title: '1kg 999 Silver Bar',
  purityKarat: '999',
  purityPercentage: 0.999,
  grossWeightGrams: 1000.0,
  pureWeightGrams: 999.0,
  purchaseRatePerGram: 84.0,
  makingCharges: 2500.0,
  gstPercentage: 3.0,
  gstAmount: 2595.0,
  totalCost: 89095.0,
  breakEvenRate: 89.18,
  custodyLocation: 'Home Safe',
  purchaseDate: '2026-01-18',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

useVaultStore.getState().setHoldings([testHoldingGold, testHoldingSilver]);

const updatedPortfolio = useVaultStore.getState().portfolio;
assert(useVaultStore.getState().holdings.length === 2, 'Holdings count must be 2');
assert(updatedPortfolio.totalInvested === 160886.0, `Total invested mismatch: ${updatedPortfolio.totalInvested}`);
assert(updatedPortfolio.totalGoldGrams === 10.0, 'Total gold grams must be 10.0');
assert(updatedPortfolio.totalSilverGrams === 1000.0, 'Total silver grams must be 1000.0');
assert(updatedPortfolio.goldAllocationPercent > 0, 'Gold allocation must be positive');
assert(updatedPortfolio.silverAllocationPercent > 0, 'Silver allocation must be positive');
console.log('✅ Passed: Holdings injection & portfolio auto-calculation verified.');

console.log('\n🎉 ALL VAULT STORE & DASHBOARD TESTS PASSED! 🚀');
