/**
 * Runtime/build PUBLIC_ vars for AdSense (SSR + dev).
 * Mirrors logic in layouts that need process.env for Kubernetes.
 */
export function getPublicAdsenseClientId(): string {
  return (
    (typeof process !== "undefined" && process.env.PUBLIC_ADSENSE_CLIENT_ID?.trim()) ||
    import.meta.env.PUBLIC_ADSENSE_CLIENT_ID?.trim() ||
    ""
  );
}

/** IAB ads.txt: google.com, pub-…, DIRECT, Google TAG ID */
const GOOGLE_ADS_TXT_TAG_ID = "f08c47fec0942fa0";

/**
 * Convert ca-pub-XXXXXXXX to ads.txt body line(s).
 * Returns empty string if unset or invalid.
 */
export function buildAdsTxtContent(clientId: string): string {
  const trimmed = clientId.trim();
  if (!trimmed) return "";

  const pub = trimmed.startsWith("ca-") ? trimmed.slice(3) : trimmed;
  if (!/^pub-\d+$/.test(pub)) return "";

  return `google.com, ${pub}, DIRECT, ${GOOGLE_ADS_TXT_TAG_ID}\n`;
}
