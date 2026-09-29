import { create } from 'zustand';
import { Holding, PortfolioSummary, SpotRate, TimeframeFilter } from '../types/bullion';
import { calculatePortfolioSummary } from '../utils/calculations';
import { fetchSpotRates } from '../services/goldApi';

interface VaultState {
  holdings: Holding[];
  spotRate: SpotRate;
  portfolio: PortfolioSummary;
  isGhostMode: boolean;
  activeTimeframe: TimeframeFilter;
  isLoading: boolean;

  toggleGhostMode: () => void;
  setTimeframe: (timeframe: TimeframeFilter) => void;
  setHoldings: (holdings: Holding[]) => void;
  refreshHoldings: () => Promise<void>;
  refreshSpotRates: () => Promise<void>;
}

const INITIAL_SPOT_RATE: SpotRate = {
  gold24kPerGram: 14880.0,
  silver999PerGram: 240.0,
  gold24hChangePercent: -0.91,
  silver24hChangePercent: 0.0,
  lastUpdated: new Date().toISOString(),
};

const INITIAL_PORTFOLIO: PortfolioSummary = {
  totalNetWorth: 0,
  totalInvested: 0,
  totalPnlAmount: 0,
  totalPnlPercentage: 0,
  totalGoldGrams: 0,
  totalSilverGrams: 0,
  goldAllocationPercent: 50,
  silverAllocationPercent: 50,
};

export const useVaultStore = create<VaultState>((set, get) => ({
  holdings: [],
  spotRate: INITIAL_SPOT_RATE,
  portfolio: INITIAL_PORTFOLIO,
  isGhostMode: false,
  activeTimeframe: '1Y',
  isLoading: false,

  toggleGhostMode: () => set((state) => ({ isGhostMode: !state.isGhostMode })),

  setTimeframe: (activeTimeframe: TimeframeFilter) => set({ activeTimeframe }),

  setHoldings: (holdings: Holding[]) => {
    const { spotRate } = get();
    const portfolio = calculatePortfolioSummary(
      holdings,
      spotRate.gold24kPerGram,
      spotRate.silver999PerGram
    );
    set({ holdings, portfolio });
  },

  refreshHoldings: async () => {
    set({ isLoading: true });
    try {
      const { getAllHoldings } = await import('../db/repository');
      const holdings = await getAllHoldings();
      const { spotRate } = get();
      const portfolio = calculatePortfolioSummary(
        holdings,
        spotRate.gold24kPerGram,
        spotRate.silver999PerGram
      );
      set({ holdings, portfolio, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  refreshSpotRates: async () => {
    try {
      const spotRate = await fetchSpotRates();
      const { holdings } = get();
      const portfolio = calculatePortfolioSummary(
        holdings,
        spotRate.gold24kPerGram,
        spotRate.silver999PerGram
      );
      set({ spotRate, portfolio });
    } catch {}
  },
}));
