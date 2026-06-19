const BLOCKED_PATTERNS: RegExp[] = [
  /(?:지금|당장|무조건|반드시)\s*(?:사|매수|담|팔|매도|청산)/i,
  /(?:사세요|팔세요|매수하세요|매도하세요)/,
  /수익\s*(?:보장|확실|확정)/,
  /(?:100|백)\s*%\s*(?:오른|수익|상승)/,
  /(?:틀림없|확실히)\s*(?:오르|내리)/,
];

const SCENARIO_PREFIX =
  "단정적 예측은 어렵고, 지인이 다룬 분석 기준으로는 이렇게 볼 수 있어요.";

export type GuardrailResult = {
  text: string;
  blocked: boolean;
  rewritten: boolean;
};

export function applyGuardrail(text: string): GuardrailResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { text: trimmed, blocked: false, rewritten: false };
  }

  const hit = BLOCKED_PATTERNS.some((pattern) => pattern.test(trimmed));
  if (!hit) {
    return { text: trimmed, blocked: false, rewritten: false };
  }

  const rewritten = `${SCENARIO_PREFIX}\n\n${trimmed.replace(/(?:사세요|팔세요|매수하세요|매도하세요)/g, "판단은 본인 몫이에요")}`;
  return { text: rewritten, blocked: true, rewritten: true };
}

export function appendDisclaimer(text: string, disclaimer: string): string {
  if (text.includes(disclaimer)) return text;
  return `${text.trim()}\n\n---\n${disclaimer}`;
}
