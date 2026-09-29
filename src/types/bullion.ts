export type MetalType = 'GOLD' | 'SILVER';

export type GoldPurity = '24K' | '22K' | '18K';
export type SilverPurity = '999' | '925';
export type PurityGrade = GoldPurity | SilverPurity;

export interface Holding {
  id: string;
  metalType: MetalType;
  title: string;
  purityKarat: PurityGrade;
  purityPercentage: number;       // e.g. 0.999 for 24K, 0.916 for 22K, 0.750 for 18K
  grossWeightGrams: number;       // Total scale weight
  pureWeightGrams: number;        // Gross weight * purity percentage
  purchaseRatePerGram: number;    // Rate in ₹ per gram
  makingCharges: number;          // Making charges in ₹
  gstPercentage: number;          // Typically 3.0%
  gstAmount: number;              // Calculated GST in ₹
  totalCost: number;              // Total acquisition cost paid
  breakEvenRate: number;          // totalCost / pureWeightGrams
  custodyLocation: string;        // e.g. 'Bank Locker (HDFC #402)', 'Home Safe'
  huidCode?: string;              // 6-digit BIS Hallmark code
  invoicePhotoUri?: string;       // Local file path (optional)
  purchaseDate: string;           // ISO YYYY-MM-DD
  createdAt: number;              // Unix timestamp
  updatedAt: number;
}

export type NewHoldingInput = Omit<Holding, 'id' | 'createdAt' | 'updatedAt'>;

export interface SpotRate {
  gold24kPerGram: number;         // e.g. ₹7,485.00
  silver999PerGram: number;       // e.g. ₹91.20
  gold24hChangePercent: number;   // e.g. +0.8
  silver24hChangePercent: number; // e.g. -0.3
  lastUpdated: string;            // ISO timestamp
}

export interface PortfolioSummary {
  totalNetWorth: number;          // Live current valuation in ₹
  totalInvested: number;          // Total purchase cost in ₹
  totalPnlAmount: number;         // Net profit/loss in ₹
  totalPnlPercentage: number;     // Net profit/loss %
  totalGoldGrams: number;         // Total gross weight in gold
  totalSilverGrams: number;       // Total gross weight in silver
  goldAllocationPercent: number;  // % of total net worth in Gold
  silverAllocationPercent: number;// % of total net worth in Silver
}

export type TimeframeFilter = '1W' | '1M' | '1Y' | '2Y' | '3Y' | '5Y' | 'ALL';
