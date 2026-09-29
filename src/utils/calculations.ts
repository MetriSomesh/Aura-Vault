import { Holding, MetalType, PortfolioSummary, PurityGrade } from '../types/bullion';

export const PURITY_FACTORS: Record<PurityGrade, number> = {
  '24K': 0.999,
  '22K': 0.916,
  '18K': 0.750,
  '999': 0.999,
  '925': 0.925,
};

/**
 * Returns purity multiplier for a given grade
 */
export function getPurityFactor(grade: PurityGrade): number {
  return PURITY_FACTORS[grade] ?? 1.0;
}

/**
 * Calculates pure fine metal weight (24K fine gold or 999 fine silver equivalent)
 */
export function calculatePureWeight(grossWeightGrams: number, purityGrade: PurityGrade): number {
  if (grossWeightGrams <= 0) return 0;
  const factor = getPurityFactor(purityGrade);
  return Number((grossWeightGrams * factor).toFixed(4));
}

/**
 * Calculates GST amount (default 3% standard on bullion in India)
 */
export function calculateGst(
  baseMetalCost: number,
  makingCharges: number = 0,
  gstPercentage: number = 3.0
): number {
  if (baseMetalCost <= 0) return 0;
  const taxableAmount = baseMetalCost + Math.max(0, makingCharges);
  return Number(((taxableAmount * gstPercentage) / 100).toFixed(2));
}

/**
 * Calculates total acquisition cost paid:
 * (Weight * Rate) + Making Charges + GST
 */
export function calculateTotalCost(
  grossWeightGrams: number,
  ratePerGram: number,
  makingCharges: number = 0,
  gstPercentage: number = 3.0
): {
  baseCost: number;
  gstAmount: number;
  totalCost: number;
} {
  const baseCost = Number((grossWeightGrams * ratePerGram).toFixed(2));
  const gstAmount = calculateGst(baseCost, makingCharges, gstPercentage);
  const totalCost = Number((baseCost + makingCharges + gstAmount).toFixed(2));

  return {
    baseCost,
    gstAmount,
    totalCost,
  };
}

/**
 * Calculates the Break-Even Spot Rate per Gram.
 * Crucial for physical bullion investors: shows the spot rate needed to
 * recoup upfront making charges and GST fees.
 */
export function calculateBreakEvenRate(totalCost: number, pureWeightGrams: number): number {
  if (pureWeightGrams <= 0) return 0;
  return Number((totalCost / pureWeightGrams).toFixed(2));
}

/**
 * Calculates current market valuation based on pure equivalent weight and spot rate
 */
export function calculateHoldingValuation(
  holding: Pick<Holding, 'metalType' | 'pureWeightGrams'>,
  currentGoldRatePerGram: number,
  currentSilverRatePerGram: number
): number {
  const spotRate = holding.metalType === 'GOLD' ? currentGoldRatePerGram : currentSilverRatePerGram;
  return Number((holding.pureWeightGrams * spotRate).toFixed(2));
}

/**
 * Calculates Profit / Loss amount and percentage
 */
export function calculatePnl(currentValuation: number, totalCost: number): {
  amount: number;
  percentage: number;
  isProfit: boolean;
} {
  const amount = Number((currentValuation - totalCost).toFixed(2));
  const percentage = totalCost > 0 ? Number(((amount / totalCost) * 100).toFixed(2)) : 0;
  return {
    amount,
    percentage,
    isProfit: amount >= 0,
  };
}

/**
 * Aggregates complete portfolio valuation, invested capital, P&L, and asset allocation
 */
export function calculatePortfolioSummary(
  holdings: Holding[],
  currentGoldRate: number,
  currentSilverRate: number
): PortfolioSummary {
  let totalNetWorth = 0;
  let totalInvested = 0;
  let totalGoldGrams = 0;
  let totalSilverGrams = 0;
  let goldValuation = 0;
  let silverValuation = 0;

  for (const item of holdings) {
    totalInvested += item.totalCost;
    const currentVal = calculateHoldingValuation(item, currentGoldRate, currentSilverRate);
    totalNetWorth += currentVal;

    if (item.metalType === 'GOLD') {
      totalGoldGrams += item.grossWeightGrams;
      goldValuation += currentVal;
    } else {
      totalSilverGrams += item.grossWeightGrams;
      silverValuation += currentVal;
    }
  }

  const totalPnlAmount = Number((totalNetWorth - totalInvested).toFixed(2));
  const totalPnlPercentage =
    totalInvested > 0 ? Number(((totalPnlAmount / totalInvested) * 100).toFixed(2)) : 0;

  const goldAllocationPercent =
    totalNetWorth > 0 ? Math.round((goldValuation / totalNetWorth) * 100) : 50;
  const silverAllocationPercent = totalNetWorth > 0 ? 100 - goldAllocationPercent : 50;

  return {
    totalNetWorth: Number(totalNetWorth.toFixed(2)),
    totalInvested: Number(totalInvested.toFixed(2)),
    totalPnlAmount,
    totalPnlPercentage,
    totalGoldGrams: Number(totalGoldGrams.toFixed(2)),
    totalSilverGrams: Number(totalSilverGrams.toFixed(2)),
    goldAllocationPercent,
    silverAllocationPercent,
  };
}
