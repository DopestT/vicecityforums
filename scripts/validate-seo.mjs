import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://vicecityforums.com";
const routes = [
  ["index.html", "/"],
  ["gta-6-news/index.html", "/gta-6-news"],
  ["gta-6-release-date/index.html", "/gta-6-release-date"],
  ["gta-6-characters/index.html", "/gta-6-characters"],
  ["gta-6-map-locations/index.html", "/gta-6-map-locations"],
  ["gta-6-trailers/index.html", "/gta-6-trailers"],
  ["gta-6-funny-clips/index.html", "/gta-6-funny-clips"],
  ["gta-6-forums/index.html", "/gta-6-forums"],
  ["gta-6-pre-order/index.html", "/gta-6-pre-order"],
  ["gta-6-gameplay/index.html", "/gta-6-gameplay"],
  ["gta-6-pc/index.html", "/gta-6-pc"],
  ["gta-6-vehicles/index.html", "/gta-6-vehicles"],
  ["gta-6-countdown/index.html", "/gta-6-countdown"],
];

const failures = [];
const titles = new Set();
const descriptions = new Set();

function fail(file, message) {
  failures.push(`${file}: ${message}`);
}

function requireMatch(file, html, pattern, label) {
  const match = html.match(pattern);
  if (!match) {
    fail(file, `missing ${label}`);
    return "";
  }
  return match[1] ?? "";
}

function decode(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function localTargetExists(sourceFile, href) {
  let pathname;
  if (href.startsWith(origin)) {
    pathname = new URL(href).pathname;
  } else if (/^(?:https?:|mailto:|tel:|#)/.test(href)) {
    return true;
  } else {
    pathname = new URL(href, `${origin}/${sourceFile}`).pathname;
  }

  const clean = decodeURIComponent(pathname);
  const target = clean.endsWith("/")
    ? resolve(root, `.${clean}`, "index.html")
    : resolve(root, `.${clean}`);
  return target.startsWith(root) && existsSync(target);
}

for (const [file, route] of routes) {
  const html = readFileSync(resolve(root, file), "utf8");
  const title = decode(requireMatch(file, html, /<title>([^<]+)<\/title>/i, "title"));
  const description = decode(requireMatch(file, html, /<meta name="description" content="([^"]+)"/i, "meta description"));
  const canonical = requireMatch(file, html, /<link rel="canonical" href="([^"]+)"/i, "canonical URL");
  const robots = requireMatch(file, html, /<meta name="robots" content="([^"]+)"/i, "robots directive");
  const h1Count = (html.match(/<h1(?:\s[^>]*)?>/gi) ?? []).length;
  const wordCount = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ").length;

  if (title.length < 30 || title.length > 75) fail(file, `title length is ${title.length}; expected 30–75`);
  if (description.length < 110 || description.length > 165) fail(file, `description length is ${description.length}; expected 110–165`);
  if (titles.has(title)) fail(file, "duplicate title");
  if (descriptions.has(description)) fail(file, "duplicate meta description");
  titles.add(title);
  descriptions.add(description);
  if (canonical !== `${origin}${route}`) fail(file, `canonical is ${canonical}`);
  if (!robots.includes("index,follow")) fail(file, `unexpected robots directive: ${robots}`);
  if (h1Count !== 1) fail(file, `expected exactly one h1, found ${h1Count}`);
  if (wordCount < (route === "/" ? 60 : 350)) fail(file, `thin rendered source (${wordCount} words)`);

  for (const required of ["og:title", "og:description", "og:url", "og:image"]) {
    if (!html.includes(`property="${required}"`)) fail(file, `missing ${required}`);
  }
  if (!html.includes('name="twitter:card" content="summary_large_image"')) fail(file, "missing Twitter card");

  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  if (scripts.length === 0) fail(file, "missing JSON-LD");
  for (const script of scripts) {
    try {
      JSON.parse(script[1]);
    } catch (error) {
      fail(file, `invalid JSON-LD: ${error.message}`);
    }
  }

  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (!localTargetExists(file, href)) fail(file, `broken internal link: ${href}`);
  }
}

const expectedUrls = routes.map(([, route]) => `${origin}${route}`).sort();
const sitemap = readFileSync(resolve(root, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).sort();
if (JSON.stringify(sitemapUrls) !== JSON.stringify(expectedUrls)) fail("sitemap.xml", "URL set does not match indexable routes");

const robots = readFileSync(resolve(root, "robots.txt"), "utf8");
if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) fail("robots.txt", "missing canonical sitemap declaration");

for (const jsonFile of ["site.webmanifest", "vercel.json"]) {
  try {
    JSON.parse(readFileSync(resolve(root, jsonFile), "utf8"));
  } catch (error) {
    fail(jsonFile, `invalid JSON: ${error.message}`);
  }
}

for (const asset of ["assets/favicon.svg", "assets/brand/vice-city-forums-logo-512.png", "assets/og/vice-city-forums-1200x630.png", "feed.xml", "404.html", "llms.txt"]) {
  if (!existsSync(resolve(root, asset))) fail(asset, "missing required discovery asset");
}

if (failures.length > 0) {
  console.error(`SEO validation failed (${failures.length}):\n- ${failures.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log(`SEO validation passed: ${routes.length} indexable pages, unique metadata, valid JSON-LD, sitemap coverage, and internal links.`);
}
