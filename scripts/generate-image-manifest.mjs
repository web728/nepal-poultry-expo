#!/usr/bin/env node
/**
 * Build-time image manifest generator.
 *
 * Scans public/images recursively and writes src/data/image-manifest.json with the
 * path, intrinsic size, a tiny blur placeholder, the folder category and the alt text
 * of every image. Pages look images up by path (so <Image> always gets correct
 * width/height), and the gallery lists every entry flagged `gallery: true`.
 *
 * Which images count as gallery images is controlled by
 * src/config/image-manifest.config.json (include / exclude globs). Byte-identical
 * duplicates are listed once.
 *
 * Runs automatically before `npm run dev` and `npm run build`.
 */
import { createHash } from "node:crypto";
import { readFile, readdir, writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const imagesDir = path.join(root, "public", "images");
const configPath = path.join(root, "src", "config", "image-manifest.config.json");
const outPath = path.join(root, "src", "data", "image-manifest.json");

const config = JSON.parse(await readFile(configPath, "utf8"));
const extensions = new Set(config.extensions.map((e) => e.toLowerCase()));

/** Minimal glob → RegExp: supports `**`, `*` and `?`. */
function globToRegExp(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") {
        i++;
        if (glob[i + 1] === "/") {
          i++;
          re += "(?:.*/)?";
        } else {
          re += ".*";
        }
      } else {
        re += "[^/]*";
      }
    } else if (c === "?") {
      re += "[^/]";
    } else {
      re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    }
  }
  return new RegExp(`^${re}$`, "i");
}

const includes = config.gallery.include.map(globToRegExp);
const excludes = config.gallery.exclude.map(globToRegExp);
const isGallery = (rel) =>
  includes.some((r) => r.test(rel)) && !excludes.some((r) => r.test(rel));

async function walk(dir) {
  const out = [];
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (extensions.has(path.extname(entry.name).slice(1).toLowerCase())) out.push(full);
  }
  return out;
}

/** Natural sort so poultry-2 comes before poultry-10. */
const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

const files = (await walk(imagesDir)).sort((a, b) => collator.compare(a, b));
const seen = new Map();
const images = [];
const duplicates = [];

// Re-use measurements from the previous run for files whose size and mtime are unchanged.
const previous = new Map();
try {
  const old = JSON.parse(await readFile(outPath, "utf8"));
  for (const i of old.images ?? []) previous.set(i.path, i);
} catch {}

async function measure(file, fileStat, rel) {
  const cached = previous.get(rel);
  if (cached && cached.bytes === fileStat.size && cached.mtimeMs === Math.round(fileStat.mtimeMs) && cached.hash) {
    return { width: cached.width, height: cached.height, blurDataURL: cached.blurDataURL, hash: cached.hash };
  }
  const buf = await readFile(file);
  const hash = createHash("sha1").update(buf).digest("hex").slice(0, 16);
  const meta = await sharp(buf).metadata();
  const oriented = meta.orientation && meta.orientation >= 5;
  const blur = await sharp(buf).rotate().resize(12, 12, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
  return {
    width: oriented ? meta.height : meta.width,
    height: oriented ? meta.width : meta.height,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    hash,
  };
}

for (const file of files) {
  const rel = path.relative(imagesDir, file).split(path.sep).join("/");
  const fileStat = await stat(file);
  const { width, height, blurDataURL, hash } = await measure(file, fileStat, rel);
  if (seen.has(hash)) {
    duplicates.push([rel, seen.get(hash)]);
    continue;
  }
  seen.set(hash, rel);

  const folder = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
  const category = config.categories[folder];

  images.push({
    src: `/images/${rel}`,
    path: rel,
    file: path.basename(rel),
    folder,
    category: category ? category.label : folder.split("/").pop() || "general",
    width,
    height,
    alt: config.alt[rel] ?? config.defaultAlt,
    blurDataURL,
    gallery: isGallery(rel),
    bytes: fileStat.size,
    mtimeMs: Math.round(fileStat.mtimeMs),
    hash,
  });
}

const manifest = {
  generatedAt: new Date().toISOString(),
  count: images.length,
  galleryCount: images.filter((i) => i.gallery).length,
  categories: config.categories,
  images,
};

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, `${JSON.stringify(manifest, null, 2)}\n`);

for (const [dup, original] of duplicates) {
  console.warn(`[image-manifest] skipped duplicate ${dup} (identical to ${original})`);
}
console.log(
  `[image-manifest] ${manifest.count} images (${manifest.galleryCount} in gallery) → src/data/image-manifest.json`,
);
