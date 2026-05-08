export interface Trade {
  entryPrice: number;
  exitPrice: number;
}

export function calculateReturns(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }

  const first = values[0];
  const last = values[values.length - 1];
  if (first === 0) {
    return 0;
  }

  return Number((((last - first) / first) * 100).toFixed(2));
}

export function calculateSharpe(returns: number[], riskFreeRate = 0): number {
  if (returns.length === 0) {
    return 0;
  }

  const excessReturns = returns.map((value) => value - riskFreeRate);
  const mean = excessReturns.reduce((sum, value) => sum + value, 0) / excessReturns.length;
  const variance =
    excessReturns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / excessReturns.length;
  const std = Math.sqrt(variance);

  if (std === 0) {
    return 0;
  }

  return Number((mean / std).toFixed(4));
}

export function calculateMDD(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }

  let peak = values[0];
  let maxDrawdown = 0;

  for (const value of values) {
    if (value > peak) {
      peak = value;
    }
    if (peak === 0) {
      continue;
    }
    const drawdown = ((peak - value) / peak) * 100;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  return Number(maxDrawdown.toFixed(2));
}

export function calculateHitRate(trades: Trade[]): number {
  if (trades.length === 0) {
    return 0;
  }

  const wins = trades.filter((trade) => trade.exitPrice > trade.entryPrice).length;
  return Number(((wins / trades.length) * 100).toFixed(2));
}
