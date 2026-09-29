import { Holding } from '../../../types/bullion';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ TEST FAILED: ${message}`);
  }
}

console.log('🧪 Starting Ledger Filter & Search Engine Test Suite...\n');

const testHoldings: Holding[] = [
  {
    id: '1',
    metalType: 'GOLD',
    title: '10g Kundan 24K Gold Bar',
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
    custodyLocation: 'Bank Locker (HDFC #402)',
    huidCode: 'KDN-8849-AU',
    purchaseDate: '2026-08-14',
    createdAt: 1,
    updatedAt: 1,
  },
  {
    id: '2',
    metalType: 'SILVER',
    title: '1 kg MMTC-PAMP Silver Bar',
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
    huidCode: 'PAMP-SIL-0412',
    purchaseDate: '2026-01-18',
    createdAt: 2,
    updatedAt: 2,
  },
  {
    id: '3',
    metalType: 'GOLD',
    title: '50g PAMP Suisse Gold Cast Bar',
    purityKarat: '24K',
    purityPercentage: 0.999,
    grossWeightGrams: 50.0,
    pureWeightGrams: 49.95,
    purchaseRatePerGram: 6120.0,
    makingCharges: 3500.0,
    gstPercentage: 3.0,
    gstAmount: 9285.0,
    totalCost: 318785.0,
    breakEvenRate: 6382.08,
    custodyLocation: 'Swiss Vault ZRH-04',
    huidCode: 'PAMP-AU-9912',
    purchaseDate: '2025-09-12',
    createdAt: 3,
    updatedAt: 3,
  },
];

function filterHoldings(items: Holding[], activeFilter: string, searchQuery: string): Holding[] {
  return items.filter((item) => {
    if (activeFilter === 'GOLD' && item.metalType !== 'GOLD') return false;
    if (activeFilter === 'SILVER' && item.metalType !== 'SILVER') return false;

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
}

// 1. ALL Filter
const allResult = filterHoldings(testHoldings, 'ALL', '');
assert(allResult.length === 3, 'ALL filter must return all 3 items');
console.log('✅ Passed: ALL filter verified.');

// 2. GOLD Filter
const goldResult = filterHoldings(testHoldings, 'GOLD', '');
assert(goldResult.length === 2, 'GOLD filter must return 2 items');
assert(goldResult.every((i) => i.metalType === 'GOLD'), 'Every item in GOLD filter must be GOLD');
console.log('✅ Passed: GOLD filter verified.');

// 3. SILVER Filter
const silverResult = filterHoldings(testHoldings, 'SILVER', '');
assert(silverResult.length === 1, 'SILVER filter must return 1 item');
assert(silverResult[0].title === '1 kg MMTC-PAMP Silver Bar', 'Silver item match verified');
console.log('✅ Passed: SILVER filter verified.');

// 4. Search by Title
const searchTitleResult = filterHoldings(testHoldings, 'ALL', 'kundan');
assert(searchTitleResult.length === 1, 'Search for "kundan" must match 1 item');
assert(searchTitleResult[0].id === '1', 'Matches Kundan gold bar');
console.log('✅ Passed: Title search verified.');

// 5. Search by Locker Location
const searchLockerResult = filterHoldings(testHoldings, 'ALL', 'hdfc');
assert(searchLockerResult.length === 1, 'Search for "hdfc" must match 1 item');
assert(searchLockerResult[0].custodyLocation.includes('HDFC'), 'Matches HDFC locker item');
console.log('✅ Passed: Locker location search verified.');

// 6. Search by HUID Code
const searchHuidResult = filterHoldings(testHoldings, 'ALL', 'PAMP-SIL');
assert(searchHuidResult.length === 1, 'Search for HUID must match 1 item');
assert(searchHuidResult[0].huidCode === 'PAMP-SIL-0412', 'Matches HUID code');
console.log('✅ Passed: HUID search verified.');

console.log('\n🎉 ALL FILTER & SEARCH ENGINE TESTS PASSED! 🚀');
