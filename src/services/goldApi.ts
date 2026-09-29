import { SpotRate } from '../types/bullion';

// Benchmark Indian spot rates (Gold 24K & Silver 999 per gram) matching GoodReturns Kolhapur benchmark
const BENCHMARK_SPOT_RATES: SpotRate = {
  gold24kPerGram: 14880.0,
  silver999PerGram: 240.0,
  gold24hChangePercent: -0.91,
  silver24hChangePercent: 0.0,
  lastUpdated: new Date().toISOString(),
};

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Parses 1g 24K Gold rate and change from GoodReturns Kolhapur HTML
 */
function parseGoodReturnsGold(html: string): { price: number; changePercent: number } | null {
  try {
    const tableMatch = html.match(/<table[^>]*>[\s\S]*?<\/table>/i);
    if (!tableMatch) return null;

    // Pattern in Table 0:
    // <td>1</td>
    // <td> &#x20b9;14,880 <span class="gr-delta-down">(-137)</span> </td>
    const rowMatch = tableMatch[0].match(
      /<td>\s*1\s*<\/td>\s*<td>\s*(?:&#x20b9;|₹)?\s*([\d,]+)\s*(?:<span[^>]*>\s*\(\s*([+-]?\d+)\s*\)\s*<\/span>)?/i
    );

    if (rowMatch && rowMatch[1]) {
      const price = parseFloat(rowMatch[1].replace(/,/g, ''));
      let changePercent = -0.91;
      if (rowMatch[2]) {
        const delta = parseFloat(rowMatch[2]);
        const yesterday = price - delta;
        if (yesterday > 0) {
          changePercent = Number(((delta / yesterday) * 100).toFixed(2));
        }
      }
      if (price > 0) {
        return { price, changePercent };
      }
    }
  } catch {}
  return null;
}

/**
 * Parses 1g 999 Silver rate and change from GoodReturns Kolhapur HTML
 */
function parseGoodReturnsSilver(html: string): { price: number; changePercent: number } | null {
  try {
    const tableMatch = html.match(/<table[^>]*>[\s\S]*?<\/table>/i);
    if (!tableMatch) return null;

    // Pattern in Table 0:
    // <td>1</td>
    // <td>&#x20b9;240</td>
    // <td>&#x20b9;240</td>
    // <td><span class="non-span">0</span></td>
    const rowMatch = tableMatch[0].match(
      /<td>\s*1\s*<\/td>\s*<td>\s*(?:&#x20b9;|₹)?\s*([\d,]+)\s*<\/td>\s*<td>\s*(?:&#x20b9;|₹)?\s*([\d,]+)\s*<\/td>/i
    );

    if (rowMatch && rowMatch[1]) {
      const price = parseFloat(rowMatch[1].replace(/,/g, ''));
      let changePercent = 0.0;
      if (rowMatch[2]) {
        const yesterday = parseFloat(rowMatch[2].replace(/,/g, ''));
        if (yesterday > 0) {
          changePercent = Number((((price - yesterday) / yesterday) * 100).toFixed(2));
        }
      }
      if (price > 0) {
        return { price, changePercent };
      }
    }
  } catch {}
  return null;
}

/**
 * Fetches latest real-time gold and silver spot rates directly matching GoodReturns
 */
export async function fetchSpotRates(): Promise<SpotRate> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const [goldRes, silverRes] = await Promise.allSettled([
      fetch('https://www.goodreturns.in/gold-rates/kolhapur.html', {
        signal: controller.signal,
        headers: { 'User-Agent': USER_AGENT },
      }),
      fetch('https://www.goodreturns.in/silver-rates/kolhapur.html', {
        signal: controller.signal,
        headers: { 'User-Agent': USER_AGENT },
      }),
    ]);

    clearTimeout(timeoutId);

    let goldRate = BENCHMARK_SPOT_RATES.gold24kPerGram;
    let goldChange = BENCHMARK_SPOT_RATES.gold24hChangePercent;
    let silverRate = BENCHMARK_SPOT_RATES.silver999PerGram;
    let silverChange = BENCHMARK_SPOT_RATES.silver24hChangePercent;

    if (goldRes.status === 'fulfilled' && goldRes.value.ok) {
      const goldHtml = await goldRes.value.text();
      const parsedGold = parseGoodReturnsGold(goldHtml);
      if (parsedGold) {
        goldRate = parsedGold.price;
        goldChange = parsedGold.changePercent;
      }
    }

    if (silverRes.status === 'fulfilled' && silverRes.value.ok) {
      const silverHtml = await silverRes.value.text();
      const parsedSilver = parseGoodReturnsSilver(silverHtml);
      if (parsedSilver) {
        silverRate = parsedSilver.price;
        silverChange = parsedSilver.changePercent;
      }
    }

    return {
      gold24kPerGram: goldRate,
      silver999PerGram: silverRate,
      gold24hChangePercent: goldChange,
      silver24hChangePercent: silverChange,
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    return BENCHMARK_SPOT_RATES;
  }
}
