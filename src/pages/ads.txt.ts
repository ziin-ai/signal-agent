import type { APIRoute } from "astro";
import { buildAdsTxtContent, getPublicAdsenseClientId } from "../lib/adsense-public-env";

export const GET: APIRoute = () => {
  const body =
    buildAdsTxtContent(getPublicAdsenseClientId()) ||
    "# ads.txt: set PUBLIC_ADSENSE_CLIENT_ID (ca-pub-…) to authorize sellers\n";

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
