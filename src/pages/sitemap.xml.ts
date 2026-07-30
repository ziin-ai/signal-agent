import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

function toIsoDate(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

export const GET: APIRoute = async ({ site }) => {
  const origin = site?.toString().replace(/\/$/, "") ?? "https://ziin.ai";
  const posts = await getCollection("posts");
  const published = posts.filter((p) => p.data.draft !== true);

  const staticUrls = [
    { loc: `${origin}/`, lastmod: undefined },
    { loc: `${origin}/posts`, lastmod: undefined },
    { loc: `${origin}/timeline`, lastmod: undefined },
    { loc: `${origin}/about`, lastmod: undefined },
    { loc: `${origin}/privacy`, lastmod: undefined },
    { loc: `${origin}/terms`, lastmod: undefined },
    { loc: `${origin}/contact`, lastmod: undefined },
  ];

  const postUrls = published.map((post) => {
    const slug = post.id.replace(/\.md$/, "");
    return {
      loc: `${origin}/posts/${slug}`,
      lastmod: toIsoDate(post.data.date),
    };
  });

  const dashboardUrls = published.map((post) => {
    const slug = post.id.replace(/\.md$/, "");
    return {
      loc: `${origin}/dashboard/${slug}`,
      lastmod: toIsoDate(post.data.date),
    };
  });

  const entries = [...staticUrls, ...postUrls, ...dashboardUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `<url>
  <loc>${entry.loc}</loc>${entry.lastmod ? `
  <lastmod>${entry.lastmod}</lastmod>` : ""}
</url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};

