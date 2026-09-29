import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { useVaultStore } from '../../store/useVaultStore';
import { TimeframeFilter } from '../../types/bullion';

const TIMEFRAMES: TimeframeFilter[] = ['1W', '1M', '1Y', '2Y', '3Y', '5Y', 'ALL'];

// Days in each timeframe filter
const TIMEFRAME_DAYS: Record<TimeframeFilter, number> = {
  '1W': 7,
  '1M': 30,
  '1Y': 365,
  '2Y': 730,
  '3Y': 1095,
  '5Y': 1825,
  ALL: 0,
};

export function ReturnsChart() {
  const { activeTimeframe, setTimeframe, portfolio, holdings, spotRate, isGhostMode } =
    useVaultStore();

  const screenWidth = Math.max(280, Dimensions.get('window').width - 48);
  const chartHeight = 130;
  const hasHoldings = holdings.length > 0 && portfolio.totalInvested > 0;

  const { pathD, fillD, baselineY, displayGain, isPositive } = useMemo(() => {
    const midY = chartHeight / 2;

    if (!hasHoldings) {
      return {
        pathD: `M 0 ${midY} L ${screenWidth} ${midY}`,
        fillD: `M 0 ${midY} L ${screenWidth} ${midY} L ${screenWidth} ${chartHeight} L 0 ${chartHeight} Z`,
        baselineY: midY,
        displayGain: '0.00%',
        isPositive: true,
      };
    }

    const totalInvested = portfolio.totalInvested;
    const currentValuation = portfolio.totalNetWorth;
    const now = Date.now();

    // 1. Determine timeframe start date
    let windowStartTime = now;
    if (activeTimeframe === 'ALL') {
      const earliest = Math.min(...holdings.map((h) => new Date(h.purchaseDate).getTime()));
      windowStartTime = isNaN(earliest) ? now - 365 * 86400000 : earliest;
    } else {
      const days = TIMEFRAME_DAYS[activeTimeframe];
      windowStartTime = now - days * 86400000;
    }

    // 2. Generate points across the active timeframe window
    const NUM_STEPS = 12;
    const stepTime = (now - windowStartTime) / (NUM_STEPS - 1);
    const stepX = screenWidth / (NUM_STEPS - 1);

    // Compute portfolio value at each sample timestamp
    const samples: { x: number; value: number }[] = [];
    for (let i = 0; i < NUM_STEPS; i++) {
      const sampleTime = windowStartTime + i * stepTime;
      const progress = i / (NUM_STEPS - 1); // 0 at window start -> 1 at now

      let sampleValuation = 0;
      for (const h of holdings) {
        const purchaseTime = new Date(h.purchaseDate).getTime();
        if (sampleTime < purchaseTime) {
          // Holding was not yet purchased at this point in the past
          continue;
        }

        // Current spot value of holding's pure weight
        const currentMetalRate =
          h.metalType === 'GOLD' ? spotRate.gold24kPerGram : spotRate.silver999PerGram;
        const currentPureVal = h.pureWeightGrams * currentMetalRate;

        // Value progression from acquisition cost to current spot valuation
        const holdingAge = Math.max(0, sampleTime - purchaseTime);
        const totalHoldingDuration = Math.max(86400000, now - purchaseTime);
        const holdingProgress = Math.min(1, Math.max(0, holdingAge / totalHoldingDuration));

        // Smooth growth curve from initial acquisition cost to current valuation
        const holdingVal = h.totalCost + (currentPureVal - h.totalCost) * holdingProgress;
        sampleValuation += holdingVal;
      }

      // If no holdings were active at sampleTime (before any acquisition), value is 0
      samples.push({ x: i * stepX, value: sampleValuation });
    }

    // Ensure the final point matches exactly current net worth
    samples[samples.length - 1].value = currentValuation;

    // 3. Compute SVG coordinate scaling relative to Invested Cost baseline
    // The benchmark baseline is totalInvested
    const allValues = samples.map((s) => s.value).filter((v) => v > 0);
    const minVal = Math.min(...allValues, totalInvested * 0.95);
    const maxVal = Math.max(...allValues, totalInvested * 1.05);
    const range = maxVal - minVal || 1;

    const paddingY = 16;
    const usableHeight = chartHeight - paddingY * 2;

    const getY = (val: number) => {
      const normalized = (val - minVal) / range;
      // Invert Y so highest value is near the top
      return chartHeight - paddingY - normalized * usableHeight;
    };

    const costBaselineY = getY(totalInvested);

    // Map samples to coordinates
    const points = samples.map((s) => {
      // If holding was not yet acquired (value 0), clamp to baseline
      const yVal = s.value === 0 ? costBaselineY : getY(s.value);
      return { x: s.x, y: yVal };
    });

    // 4. Build smooth bezier curve
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = ((prev.x + curr.x) / 2).toFixed(1);
      d += ` C ${midX} ${prev.y.toFixed(1)}, ${midX} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
    }

    const fill = `${d} L ${screenWidth} ${chartHeight} L 0 ${chartHeight} Z`;

    const pnlPercent = portfolio.totalPnlPercentage;
    const isGainPositive = pnlPercent >= 0;
    const gainText = isGhostMode
      ? '••••'
      : `${isGainPositive ? '+' : ''}${pnlPercent.toFixed(2)}% (${activeTimeframe})`;

    return {
      pathD: d,
      fillD: fill,
      baselineY: costBaselineY,
      displayGain: gainText,
      isPositive: isGainPositive,
    };
  }, [hasHoldings, activeTimeframe, holdings, portfolio, spotRate, isGhostMode, screenWidth, chartHeight]);

  return (
    <View style={styles.card}>
      {/* Header & Benchmark */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>VALUATION TRAJECTORY</Text>
        <Text
          style={[
            styles.performanceGain,
            !isPositive && styles.lossText,
            !hasHoldings && styles.neutralText,
          ]}
        >
          {displayGain}
        </Text>
      </View>

      {/* Timeframe Filter Pills */}
      <View style={styles.timeframesRow}>
        {TIMEFRAMES.map((tf) => {
          const isActive = activeTimeframe === tf;
          return (
            <TouchableOpacity
              key={tf}
              style={[styles.timeframePill, isActive && styles.activePill]}
              onPress={() => setTimeframe(tf)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.timeframeText,
                  isActive && styles.activeTimeframeText,
                ]}
              >
                {tf}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* SVG Chart */}
      <View style={styles.chartContainer}>
        <Svg width={screenWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0%"
                stopColor={isPositive ? colors.gold.primary : colors.loss.text}
                stopOpacity={hasHoldings ? 0.35 : 0.08}
              />
              <Stop
                offset="100%"
                stopColor={isPositive ? colors.gold.primary : colors.loss.text}
                stopOpacity={0.0}
              />
            </LinearGradient>
          </Defs>

          {/* Acquisition Cost Reference Baseline */}
          <Line
            x1="0"
            y1={baselineY}
            x2={screenWidth}
            y2={baselineY}
            stroke={colors.border.subtle}
            strokeWidth="1"
            strokeDasharray="4, 4"
          />

          {/* Gradient Area Fill */}
          <Path d={fillD} fill="url(#goldGradient)" />

          {/* Clean Trajectory Curve */}
          <Path
            d={pathD}
            fill="none"
            stroke={
              hasHoldings
                ? isPositive
                  ? colors.gold.primary
                  : colors.loss.text
                : colors.border.subtle
            }
            strokeWidth={hasHoldings ? 2.5 : 1.5}
          />
        </Svg>

        {!hasHoldings && (
          <View style={styles.emptyOverlay}>
            <Text style={styles.emptyOverlayText}>
              No transactions recorded yet • Tap + to log holding
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 16,
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.0,
  },
  performanceGain: {
    color: colors.profit.text,
    fontSize: 12,
    fontWeight: '600',
  },
  lossText: {
    color: colors.loss.text,
  },
  neutralText: {
    color: colors.text.tertiary,
  },
  timeframesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  timeframePill: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  activePill: {
    backgroundColor: colors.gold.primary,
    borderColor: colors.gold.primary,
  },
  timeframeText: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: '600',
  },
  activeTimeframeText: {
    color: colors.canvas,
    fontWeight: '700',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  emptyOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 9, 12, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  emptyOverlayText: {
    color: colors.text.tertiary,
    fontSize: 10,
    fontWeight: '500',
  },
});
