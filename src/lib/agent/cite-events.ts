export const JIIN_CITE_EVENT = "jiin:cite";

export type JiinCiteDetail = {
  sourceId: string;
};

export function dispatchJiinCite(sourceId: string): void {
  window.dispatchEvent(
    new CustomEvent(JIIN_CITE_EVENT, {
      detail: { sourceId } satisfies JiinCiteDetail,
    }),
  );
}

export type PostSourceChip = {
  id: string;
  tier: 0 | 1 | 2 | 3 | 4;
  type: string;
  title: string;
  excerpt: string;
  url: string;
};

export function tierLabel(tier: PostSourceChip["tier"]): string {
  if (tier === 0) return "T0 반박";
  if (tier === 1) return "T1 1차 자료";
  if (tier === 2) return "T2 전문 리포트";
  if (tier === 3) return "T3 언론";
  return "T4 2차·익명";
}

export function explainSourceChip(source: PostSourceChip): { title: string; body: string; url: string } {
  return {
    title: `${source.id} · ${tierLabel(source.tier)}`,
    body: `${source.title}\n\n${source.excerpt}`,
    url: source.url,
  };
}
