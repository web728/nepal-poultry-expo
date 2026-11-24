#!/usr/bin/env node
/**
 * One-off migration of the usable media from the WordPress backup into this project.
 *
 *   node scripts/migrate-wp-assets.mjs "<path-to>/wp-source-assets/uploads"
 *
 * - Event photographs (poultry-N.jpg, 6000x4000 originals) are resized to a 2000px
 *   web master and written to public/images/gallery/2017-chitwan/ with their original
 *   file names. Next.js <Image> generates the smaller responsive variants on demand.
 * - Organiser / supporter / expo logos are copied to public/logos/ unchanged.
 * - The WordPress backup itself is only read, never modified.
 * - Starter-template images (yoga, courses, students) and third-party stock images are
 *   deliberately not migrated.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, copyFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const source = process.argv[2];
if (!source) {
  console.error("Usage: node scripts/migrate-wp-assets.mjs <uploads-folder>");
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, "..");
const nov2023 = path.join(source, "2023", "11");
const galleryOut = path.join(root, "public", "images", "gallery", "2017-chitwan");
const logosOut = path.join(root, "public", "logos");

const LOGOS = [
  ["nepal-poultry-logo.png", "nepal-poultry-expo-logo.png"],
  ["nepal-poultry-logo-white.png", "nepal-poultry-expo-logo-white.png"],
  ["Futurex-Logo-copy-1536x320-1.png", "futurex-trade-fair-and-events.png"],
  ["Media-Space-Logo-1.png", "media-space-solutions.png"],
  ["nepalpoultryfoundation.webp", "nepal-poultry-federation.webp"],
];

await mkdir(galleryOut, { recursive: true });
await mkdir(logosOut, { recursive: true });

const files = (await readdir(nov2023)).filter((f) => /^poultry-\d+\.jpg$/i.test(f));
files.sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

const seen = new Map();
let written = 0;
for (const file of files) {
  const buf = await readFile(path.join(nov2023, file));
  const hash = createHash("sha1").update(buf).digest("hex");
  if (seen.has(hash)) {
    console.log(`skip duplicate ${file} (same bytes as ${seen.get(hash)})`);
    continue;
  }
  seen.set(hash, file);
  await sharp(buf)
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true, progressive: true })
    .toFile(path.join(galleryOut, file));
  written++;
}

for (const [from, to] of LOGOS) {
  await copyFile(path.join(nov2023, from), path.join(logosOut, to));
}

// Site icon used by the old WordPress site (rooster mark), reused as the favicon source.
await copyFile(path.join(nov2023, "cropped-nepal.png"), path.join(root, "src", "app", "icon.png"));
await sharp(path.join(nov2023, "cropped-nepal.png"))
  .resize(180, 180)
  .png()
  .toFile(path.join(root, "src", "app", "apple-icon.png"));

console.log(`gallery images written: ${written}, logos copied: ${LOGOS.length}`);
