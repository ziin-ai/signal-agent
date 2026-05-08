export type SourceTier = 0 | 1 | 2 | 3 | 4;

export interface Source {
  id: string;
  tier: SourceTier;
  type: "filing" | "ir-call" | "report" | "news" | "anonymous";
  title: string;
  date: Date | string;
  url: string;
  excerpt: string;
}

const TIER_WEIGHT: Record<SourceTier, number> = {
  0: 0.5,
  1: 1.0,
  2: 0.7,
  3: 0.4,
  4: 0.2,
};

export function calculateScore(sources: Source[]): number {
  if (sources.length === 0) {
    return 0;
  }

  const weightedSum = sources.reduce((acc, source) => acc + TIER_WEIGHT[source.tier], 0);
  const contraCount = sources.filter((source) => source.tier === 0).length;
  const contraBonus = contraCount >= 2 ? Math.min(contraCount - 1, 3) : 0;
  const score = (weightedSum / sources.length) * 10 + contraBonus;

  return Number(Math.min(score, 10).toFixed(2));
}
