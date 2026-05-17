/**
 * generate-sitemap.mjs
 * Generates sitemap.xml and sitemap-index.xml including all blog posts.
 *
 * USAGE:
 *   node generate-sitemap.mjs
 *
 * OUTPUT:
 *   public/sitemap.xml           — all URLs in one file
 *   public/sitemap-index.xml     — sitemap index pointing to sitemap.xml
 *
 * Run this script:
 *   - As a post-build step: add "postbuild": "node generate-sitemap.mjs" to package.json scripts
 *   - Or manually before deployment: node generate-sitemap.mjs
 *
 * ADDING BLOG POSTS TO SITEMAP:
 *   New posts in blogData.js are automatically included — no changes needed here.
 */

import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────
const SITE_URL = process.env.VITE_SITE_URL || "https://naidugariruchulu.vercel.app";
const TODAY = new Date().toISOString().split("T")[0];
const PUBLIC_DIR = resolve(__dirname, "public");

// ── Static routes ─────────────────────────────────────────────────────────────
const STATIC_ROUTES = [
  { path: "/",                changefreq: "weekly",  priority: "1.0" },
  { path: "/products",        changefreq: "daily",   priority: "0.9" },
  { path: "/combos",          changefreq: "weekly",  priority: "0.8" },
  { path: "/blog",            changefreq: "weekly",  priority: "0.8" },  // ← Blog listing
  { path: "/contact",         changefreq: "monthly", priority: "0.6" },
  { path: "/faq",             changefreq: "monthly", priority: "0.6" },
  { path: "/shipping-policy", changefreq: "yearly",  priority: "0.3" },
  { path: "/return-policy",   changefreq: "yearly",  priority: "0.3" },
  { path: "/privacy-policy",  changefreq: "yearly",  priority: "0.3" },
  { path: "/terms",           changefreq: "yearly",  priority: "0.3" },
];

// ── Dynamic blog routes ───────────────────────────────────────────────────────
// We import blogData at the top-level — this is a plain Node script, not a
// browser bundle, so we read the file directly.
//
// blogData.js uses `import.meta.env` which Node doesn't support natively
// outside a bundler. We stub it with a simple polyfill below.

// Stub import.meta.env for Node execution
global.__viteEnvStub = { VITE_SITE_URL: SITE_URL };

// We can't use the ES-module blogData directly in Node without a bundler.
// Instead, we inline the blog slugs here. Keep this list in sync with blogData.js.
// (Alternatively, run this script via Vite's build hooks — see README.)
const BLOG_POSTS = [
  {
    slug: "best-andhra-pickles-online-india",
    publishedAt: "2025-01-10",
    updatedAt: "2025-05-01",
    priority: "0.8",
  },
  {
    slug: "traditional-andhra-chicken-pickle-recipe",
    publishedAt: "2025-01-25",
    updatedAt: "2025-04-15",
    priority: "0.8",
  },
  {
    slug: "why-gongura-pickle-is-famous",
    publishedAt: "2025-02-08",
    updatedAt: "2025-04-20",
    priority: "0.7",
  },
  {
    slug: "how-homemade-avakaya-is-prepared",
    publishedAt: "2025-03-01",
    updatedAt: "2025-05-01",
    priority: "0.7",
  },
  {
    slug: "best-non-veg-pickles-andhra-pradesh",
    publishedAt: "2025-03-20",
    updatedAt: "2025-05-01",
    priority: "0.7",
  },
  // ← Add new blog post slugs here when you publish them
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const url = (path, lastmod, changefreq, priority) => `
  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

// ── Build sitemap.xml ─────────────────────────────────────────────────────────
const staticEntries = STATIC_ROUTES.map((r) =>
  url(r.path, TODAY, r.changefreq, r.priority)
).join("");

const blogEntries = BLOG_POSTS.map((p) =>
  url(
    `/blog/${p.slug}`,
    p.updatedAt || p.publishedAt,
    "monthly",
    p.priority || "0.7"
  )
).join("");

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${staticEntries}
${blogEntries}
</urlset>
`;

// ── Build sitemap-index.xml ───────────────────────────────────────────────────
const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
</sitemapindex>
`;

// ── Write files ───────────────────────────────────────────────────────────────
try {
  mkdirSync(PUBLIC_DIR, { recursive: true });
  writeFileSync(resolve(PUBLIC_DIR, "sitemap.xml"), sitemapXml, "utf8");
  writeFileSync(resolve(PUBLIC_DIR, "sitemap-index.xml"), sitemapIndexXml, "utf8");
  console.log("✅ sitemap.xml generated");
  console.log("✅ sitemap-index.xml generated");
  console.log(`   Included ${STATIC_ROUTES.length} static + ${BLOG_POSTS.length} blog URLs`);
} catch (err) {
  console.error("❌ Sitemap generation failed:", err.message);
  process.exit(1);
}
