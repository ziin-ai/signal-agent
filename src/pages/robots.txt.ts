import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const origin = site?.toString().replace(/\/$/, "") ?? "https://ziin.ai";
  const isProduction = import.meta.env.PROD;
  const body = isProduction
    ? `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${origin}/sitemap.xml
Host: ${origin}
`
    : `User-agent: *
Disallow: /
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};

