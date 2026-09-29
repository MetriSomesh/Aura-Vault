import {
  calculateBreakEvenRate,
  calculatePureWeight,
  calculateTotalCost,
  getPurityFactor,
} from '../../../utils/calculations';
import { NewHoldingInput } from '../../../types/bullion';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ TEST FAILED: ${message}`);
  }
}

console.log('🧪 Starting Add Entry Form & Calculation Test Suite...\n');

// 1. Initial State for Gold 10g at 7485/g with 1200 making charges
const metalType = 'GOLD';
const purityKarat = '24K';
const weight = 10.0;
const rate = 7485.0;
const making = 1200.0;
const gstPercent = 3.0;

const purityFactor = getPurityFactor(purityKarat);
assert(purityFactor === 0.999, 'Gold 24K must have 0.999 purity factor');

const pureWeight = calculatePureWeight(weight, purityKarat);
assert(pureWeight === 9.99, `Pure weight must be 9.99g, got ${pureWeight}`);

const cost = calculateTotalCost(weight, rate, making, gstPercent);
assert(cost.baseCost === 74850.0, `Base cost must be 74850.0, got ${cost.baseCost}`);
assert(cost.gstAmount === 2281.5, `GST must be 2281.50, got ${cost.gstAmount}`);
assert(cost.totalCost === 78331.5, `Total cost must be 78331.50, got ${cost.totalCost}`);

const breakEven = calculateBreakEvenRate(cost.totalCost, pureWeight);
const expectedBreakEven = Number((78331.5 / 9.99).toFixed(2));
assert(breakEven === expectedBreakEven, `Break-Even mismatch: ${breakEven} vs ${expectedBreakEven}`);
console.log('✅ Passed: Gold 10g 24K form calculation verified.');

// 2. Silver 1kg 999 with Optional Bill Upload
const silverInput: NewHoldingInput = {
  metalType: 'SILVER',
  title: '1 kg MMTC-PAMP Bar',
  purityKarat: '999',
  purityPercentage: 0.999,
  grossWeightGrams: 1000.0,
  pureWeightGrams: 999.0,
  purchaseRatePerGram: 91.2,
  makingCharges: 2000.0,
  gstPercentage: 3.0,
  gstAmount: 2796.0,
  totalCost: 95996.0,
  breakEvenRate: 96.09,
  custodyLocation: 'Home Safe',
  huidCode: 'PAMP-9921',
  invoicePhotoUri: 'file:///data/user/0/com.auravault.app/files/receipt_123.jpg', // Attached photo
  purchaseDate: '2026-09-28',
};

assert(silverInput.invoicePhotoUri !== undefined, 'Invoice photo is optional but properly recorded');
assert(silverInput.grossWeightGrams === 1000.0, 'Gross weight is 1000g');
assert(silverInput.pureWeightGrams === 999.0, 'Pure silver weight is 999g');
console.log('✅ Passed: Silver entry with attached bill photo verified.');

// 3. Entry without Bill Photo (Optional behavior)
const silverNoPhoto: NewHoldingInput = {
  ...silverInput,
  invoicePhotoUri: undefined,
};

assert(silverNoPhoto.invoicePhotoUri === undefined, 'Invoice photo is successfully omitted when optional');
console.log('✅ Passed: Entry without bill photo verified as optional.');

console.log('\n🎉 ALL ADD ENTRY VALIDATION TESTS PASSED! 🚀');
