import {
  calculateBreakEvenRate,
  calculateGst,
  calculateHoldingValuation,
  calculatePnl,
  calculatePortfolioSummary,
  calculatePureWeight,
  calculateTotalCost,
  getPurityFactor,
} from '../calculations';
import { Holding } from '../../types/bullion';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ TEST FAILED: ${message}`);
  }
}

console.log('🧪 Starting Bullion Financial Engine Test Suite...\n');

// 1. Purity factors
assert(getPurityFactor('24K') === 0.999, '24K must be 0.999 purity');
assert(getPurityFactor('22K') === 0.916, '22K must be 0.916 purity');
assert(getPurityFactor('18K') === 0.750, '18K must be 0.750 purity');
assert(getPurityFactor('999') === 0.999, '999 Fine Silver must be 0.999 purity');
assert(getPurityFactor('925') === 0.925, '925 Sterling Silver must be 0.925 purity');
console.log('✅ Passed: Purity factors verified.');

// 2. Pure weight normalization
const pureGold22k = calculatePureWeight(10.0, '22K');
assert(pureGold22k === 9.16, `10g of 22K must be 9.16g pure gold, got ${pureGold22k}`);

const pureSilver999 = calculatePureWeight(1000.0, '999');
assert(pureSilver999 === 999.0, `1000g of 999 silver must be 999g pure, got ${pureSilver999}`);
console.log('✅ Passed: Pure weight normalization verified.');

// 3. GST calculation (3.0% on metal + making charges)
const baseCost = 74850.0;
const making = 1200.0;
const expectedGst = Number((((baseCost + making) * 3.0) / 100).toFixed(2)); // (76050 * 0.03) = 2281.50
const calculatedGst = calculateGst(baseCost, making, 3.0);
assert(calculatedGst === expectedGst, `GST mismatch: expected ${expectedGst}, got ${calculatedGst}`);
console.log('✅ Passed: GST calculation verified.');

// 4. Total Cost calculation
const costBreakdown = calculateTotalCost(10.0, 7485.0, 1200.0, 3.0);
assert(costBreakdown.baseCost === 74850.0, `Base cost mismatch: ${costBreakdown.baseCost}`);
assert(costBreakdown.gstAmount === 2281.5, `GST mismatch: ${costBreakdown.gstAmount}`);
assert(costBreakdown.totalCost === 78331.5, `Total cost mismatch: ${costBreakdown.totalCost}`);
console.log('✅ Passed: Total Cost calculation verified.');

// 5. Break-Even Spot Rate
const breakEvenRate = calculateBreakEvenRate(costBreakdown.totalCost, 9.99); // 10g 24K pure weight = 9.99g
const expectedBreakEven = Number((78331.5 / 9.99).toFixed(2)); // ~7840.99
assert(breakEvenRate === expectedBreakEven, `Break-Even mismatch: expected ${expectedBreakEven}, got ${breakEvenRate}`);
console.log('✅ Passed: Break-Even Spot Rate verified.');

// 6. Current Valuation & P&L
const sampleGoldHolding: Holding = {
  id: 'h1',
  metalType: 'GOLD',
  title: '10g 24K Bar',
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
  custodyLocation: 'Bank Locker #402',
  purchaseDate: '2026-08-14',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const currentGoldRate = 7485.0;
const currentSilverRate = 91.2;

const valuation = calculateHoldingValuation(sampleGoldHolding, currentGoldRate, currentSilverRate);
assert(valuation === 74775.15, `Valuation mismatch: ${valuation}`);

const pnl = calculatePnl(valuation, sampleGoldHolding.totalCost);
assert(pnl.isProfit === true, 'P&L should be in profit');
assert(pnl.amount === 2984.15, `P&L amount mismatch: expected 2984.15, got ${pnl.amount}`);
assert(pnl.percentage === 4.16, `P&L percentage mismatch: expected 4.16, got ${pnl.percentage}`);
console.log('✅ Passed: Current Valuation & P&L verified.');

// 7. Portfolio Summary Aggregation
const sampleSilverHolding: Holding = {
  id: 'h2',
  metalType: 'SILVER',
  title: '1kg Silver Bar',
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

const portfolio = calculatePortfolioSummary(
  [sampleGoldHolding, sampleSilverHolding],
  currentGoldRate,
  currentSilverRate
);

assert(portfolio.totalInvested === 160886.0, `Total invested mismatch: ${portfolio.totalInvested}`);
assert(portfolio.totalGoldGrams === 10.0, `Gold grams mismatch: ${portfolio.totalGoldGrams}`);
assert(portfolio.totalSilverGrams === 1000.0, `Silver grams mismatch: ${portfolio.totalSilverGrams}`);
assert(portfolio.goldAllocationPercent > 0 && portfolio.silverAllocationPercent > 0, 'Allocations must be positive');
assert(portfolio.goldAllocationPercent + portfolio.silverAllocationPercent === 100, 'Allocations must sum to 100%');
console.log('✅ Passed: Portfolio Summary Aggregation verified.');

console.log('\n🎉 ALL 7 FINANCIAL ENGINE TESTS PASSED SUCCESSFULLY! 🚀');
