import {
  calculateBreakEvenRate,
  calculatePureWeight,
  calculateTotalCost,
  calculateHoldingValuation,
  calculatePnl,
  calculatePortfolioSummary,
  getPurityFactor,
} from '../../../utils/calculations';
import { Holding, NewHoldingInput } from '../../../types/bullion';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ TEST FAILED: ${message}`);
  }
}

console.log('🧪 Starting Edit, Delete & Portfolio Recalculation Test Suite (Phase 7)...\n');

// Mock live spot rates: Gold 24K: ₹7,500/g, Silver 999: ₹92.00/g
const SPOT_GOLD = 7500.0;
const SPOT_SILVER = 92.0;

// =========================================================================
// TEST 1: Entry Creation -> Edit Transition & Recalculation
// =========================================================================
console.log('🔹 Test 1: Simulating Bullion Entry Edit & Re-computation...');

const initialEntry: Holding = {
  id: 'holding_gold_001',
  metalType: 'GOLD',
  title: '20g 22K Tanishq Bangle',
  purityKarat: '22K',
  purityPercentage: getPurityFactor('22K'), // 0.916
  grossWeightGrams: 20.0,
  pureWeightGrams: calculatePureWeight(20.0, '22K'), // 18.32g
  purchaseRatePerGram: 6800.0,
  makingCharges: 4000.0,
  gstPercentage: 3.0,
  gstAmount: 4200.0, // (20 * 6800 + 4000) * 0.03 = 140000 * 0.03 = 4200
  totalCost: 144200.0,
  breakEvenRate: calculateBreakEvenRate(144200.0, 18.32), // 144200 / 18.32 = 7871.18
  custodyLocation: 'Home Safe',
  purchaseDate: '2026-02-10',
  createdAt: 1000,
  updatedAt: 1000,
};

assert(initialEntry.pureWeightGrams === 18.32, `Initial pure weight should be 18.32g, got ${initialEntry.pureWeightGrams}`);
assert(initialEntry.breakEvenRate === 7871.18, `Break-even should be 7871.18, got ${initialEntry.breakEvenRate}`);

// User edits entry: increases weight to 25g, makes new charges 5000, updates location
const editedWeight = 25.0;
const editedMaking = 5000.0;
const editedRate = 6900.0;
const editedPureWeight = calculatePureWeight(editedWeight, '22K'); // 25 * 0.916 = 22.90g
const editedCost = calculateTotalCost(editedWeight, editedRate, editedMaking, 3.0);
// Base = 25 * 6900 = 172500; Subtotal = 177500; GST = 5325; Total = 182825
const editedBreakEven = calculateBreakEvenRate(editedCost.totalCost, editedPureWeight);

const updatedEntry: Holding = {
  ...initialEntry,
  grossWeightGrams: editedWeight,
  pureWeightGrams: editedPureWeight,
  purchaseRatePerGram: editedRate,
  makingCharges: editedMaking,
  gstAmount: editedCost.gstAmount,
  totalCost: editedCost.totalCost,
  breakEvenRate: editedBreakEven,
  custodyLocation: 'Bank Locker (HDFC #402)',
  updatedAt: 2000,
};

assert(updatedEntry.pureWeightGrams === 22.9, `Updated pure weight should be 22.9g, got ${updatedEntry.pureWeightGrams}`);
assert(updatedEntry.totalCost === 182825.0, `Updated total cost should be 182825, got ${updatedEntry.totalCost}`);
assert(updatedEntry.breakEvenRate === Number((182825 / 22.9).toFixed(2)), `Updated break-even mismatch: got ${updatedEntry.breakEvenRate}`);
assert(updatedEntry.custodyLocation === 'Bank Locker (HDFC #402)', 'Location must be updated');
console.log('✅ Passed: Entry edit & automatic formula recalculation.');

// =========================================================================
// TEST 2: Valuation & PnL Re-calculation after Edit
// =========================================================================
console.log('\n🔹 Test 2: Valuation and P&L Tracking post-edit...');

// Valuation = pureWeight * SPOT_GOLD = 22.90 * 7500 = 171750
const postEditValuation = calculateHoldingValuation(updatedEntry, SPOT_GOLD, SPOT_SILVER);
assert(postEditValuation === 171750.0, `Valuation must be 171750, got ${postEditValuation}`);

const postEditPnl = calculatePnl(postEditValuation, updatedEntry.totalCost);
// PnL = 171750 - 182825 = -11075 (unrealized loss due to making charges + GST)
assert(postEditPnl.amount === -11075.0, `P&L amount should be -11075, got ${postEditPnl.amount}`);
assert(postEditPnl.isProfit === false, 'Should be in loss position');
assert(postEditPnl.percentage === -6.06, `P&L percentage should be -6.06%, got ${postEditPnl.percentage}`);
console.log('✅ Passed: Post-edit valuation & loss position verified accurately.');

// =========================================================================
// TEST 3: Holding Deletion & Portfolio Summary Re-aggregation
// =========================================================================
console.log('\n🔹 Test 3: Holding Deletion and Portfolio Aggregation...');

const silverHolding: Holding = {
  id: 'holding_silver_002',
  metalType: 'SILVER',
  title: '500g Silver Bar 999',
  purityKarat: '999',
  purityPercentage: 0.999,
  grossWeightGrams: 500.0,
  pureWeightGrams: 499.5,
  purchaseRatePerGram: 80.0,
  makingCharges: 1000.0,
  gstPercentage: 3.0,
  gstAmount: 1230.0,
  totalCost: 42230.0,
  breakEvenRate: 84.54,
  custodyLocation: 'Home Safe',
  purchaseDate: '2026-01-01',
  createdAt: 500,
  updatedAt: 500,
};

// Initial portfolio with 2 holdings: Gold bangle + Silver bar
let portfolioList = [updatedEntry, silverHolding];
let summaryBeforeDelete = calculatePortfolioSummary(portfolioList, SPOT_GOLD, SPOT_SILVER);

// Silver Valuation = 499.5 * 92 = 45954
// Total Net Worth = 171750 + 45954 = 217704
assert(summaryBeforeDelete.totalNetWorth === 217704.0, `Net worth before delete must be 217704, got ${summaryBeforeDelete.totalNetWorth}`);
assert(summaryBeforeDelete.totalInvested === 225055.0, `Invested before delete must be 225055, got ${summaryBeforeDelete.totalInvested}`);
assert(summaryBeforeDelete.totalGoldGrams === 25.0, `Gold gross weight must be 25.0g, got ${summaryBeforeDelete.totalGoldGrams}`);
assert(summaryBeforeDelete.totalSilverGrams === 500.0, `Silver gross weight must be 500.0g, got ${summaryBeforeDelete.totalSilverGrams}`);

// SIMULATE DELETION OF GOLD ENTRY
const targetIdToDelete = updatedEntry.id;
portfolioList = portfolioList.filter((h) => h.id !== targetIdToDelete);

assert(portfolioList.length === 1, 'Only 1 holding should remain after deletion');
assert(portfolioList[0].id === silverHolding.id, 'Remaining holding must be silver bar');

// Recalculate portfolio after deletion
const summaryAfterDelete = calculatePortfolioSummary(portfolioList, SPOT_GOLD, SPOT_SILVER);
assert(summaryAfterDelete.totalNetWorth === 45954.0, `Net worth after delete must be 45954, got ${summaryAfterDelete.totalNetWorth}`);
assert(summaryAfterDelete.totalInvested === 42230.0, `Invested after delete must be 42230, got ${summaryAfterDelete.totalInvested}`);
assert(summaryAfterDelete.totalGoldGrams === 0, 'Gold grams must be 0 after gold holding deletion');
assert(summaryAfterDelete.totalSilverGrams === 500.0, 'Silver grams must remain 500.0g');
assert(summaryAfterDelete.goldAllocationPercent === 0, 'Gold allocation must drop to 0%');
assert(summaryAfterDelete.silverAllocationPercent === 100, 'Silver allocation must rise to 100%');
console.log('✅ Passed: Item deletion cleanly recomputed portfolio totals & asset splits.');

// =========================================================================
// TEST 4: Edge Case - Delete All Holdings (Zero-Vault State)
// =========================================================================
console.log('\n🔹 Test 4: Deleting Final Holding (Zero-Vault Safe State)...');

portfolioList = [];
const emptySummary = calculatePortfolioSummary(portfolioList, SPOT_GOLD, SPOT_SILVER);

assert(emptySummary.totalNetWorth === 0, 'Net worth must be 0 in empty vault');
assert(emptySummary.totalInvested === 0, 'Invested must be 0 in empty vault');
assert(emptySummary.totalPnlAmount === 0, 'P&L amount must be 0 in empty vault');
assert(emptySummary.totalPnlPercentage === 0, 'P&L percentage must not be NaN, should be 0');
assert(emptySummary.goldAllocationPercent === 50, 'Default split gracefully returns 50% without division-by-zero');
assert(emptySummary.silverAllocationPercent === 50, 'Default split gracefully returns 50% without division-by-zero');
console.log('✅ Passed: Zero-state safety verified (no NaN or divide-by-zero errors).');

console.log('\n🎉 ALL PHASE 7 EDIT & DELETE TESTS PASSED SUCCESSFULLY! 🚀');
