// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://carflex.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/listings", changefreq: "daily", priority: "0.9" },
  { path: "/sell", changefreq: "monthly", priority: "0.7" },
  { path: "/sell/vendre", changefreq: "monthly", priority: "0.6" },
  { path: "/sell/louer", changefreq: "monthly", priority: "0.6" },
  { path: "/sell/evaluer", changefreq: "monthly", priority: "0.6" },
  { path: "/subscription", changefreq: "monthly", priority: "0.6" },
  { path: "/auth", changefreq: "yearly", priority: "0.4" },
  { path: "/faq", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms-of-service", changefreq: "yearly", priority: "0.3" },
  { path: "/data-protection", changefreq: "yearly", priority: "0.3" },
];

function generateSitemap(items: SitemapEntry[]) {
  const today = new Date().toISOString().split("T")[0];
  const urls = items.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
