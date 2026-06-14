// Media preparation pipeline.
//
// Images: each assests/*.jpeg -> auto-rotated, optimized webp at widths 640/1280/1920
//         (no upscaling) into public/media/img/<basename>-<width>.webp
// Videos: each assests/*.mov -> H.264 mp4 + VP9 webm + a poster webp into
//         public/media/video/. Requires ffmpeg; if unavailable the script will
//         attempt a winget install, and otherwise skip video transcoding (still
//         processing images) with a clear warning.
//
// Run: node scripts/prep-media.mjs
// Idempotent: existing outputs are overwritten.

import { execFile, execFileSync, spawnSync } from "node:child_process";
import { promisify } from "node:util";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";
import sharp from "sharp";

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "assests");
const IMG_OUT = path.join(ROOT, "public", "media", "img");
const VID_OUT = path.join(ROOT, "public", "media", "video");

const IMAGE_WIDTHS = [640, 1280, 1920];

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

async function sizeOf(file) {
  try {
    const st = await fs.stat(file);
    return st.size;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// ffmpeg discovery / install
// ---------------------------------------------------------------------------

function tryFfmpegAt(cmd) {
  try {
    execFileSync(cmd, ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function findInstalledFfmpeg() {
  // Common winget install locations.
  const candidates = [];
  const localAppData = process.env.LOCALAPPDATA;
  if (localAppData) {
    candidates.push(path.join(localAppData, "Microsoft", "WinGet", "Links", "ffmpeg.exe"));
    // Packages dir: ...\WinGet\Packages\Gyan.FFmpeg_*\ffmpeg-*\bin\ffmpeg.exe
    const pkgRoot = path.join(localAppData, "Microsoft", "WinGet", "Packages");
    try {
      const entries = await fs.readdir(pkgRoot, { withFileTypes: true });
      for (const e of entries) {
        if (!e.isDirectory() || !/Gyan\.FFmpeg/i.test(e.name)) continue;
        const pkgDir = path.join(pkgRoot, e.name);
        // search a couple of levels deep for bin/ffmpeg.exe
        const inner = await fs.readdir(pkgDir, { withFileTypes: true }).catch(() => []);
        for (const sub of inner) {
          if (sub.isDirectory()) {
            candidates.push(path.join(pkgDir, sub.name, "bin", "ffmpeg.exe"));
          }
        }
        candidates.push(path.join(pkgDir, "bin", "ffmpeg.exe"));
      }
    } catch {
      /* ignore */
    }
  }
  for (const c of candidates) {
    if (tryFfmpegAt(c)) return c;
  }
  return null;
}

async function ensureFfmpeg() {
  // 1. Already on PATH?
  if (tryFfmpegAt("ffmpeg")) return "ffmpeg";

  // 2. Already installed somewhere by winget?
  let found = await findInstalledFfmpeg();
  if (found) return found;

  // 3. Try installing via winget (Windows only).
  if (os.platform() === "win32") {
    console.log("[ffmpeg] not found — attempting winget install (Gyan.FFmpeg)...");
    const res = spawnSync(
      "winget",
      [
        "install",
        "--silent",
        "--accept-package-agreements",
        "--accept-source-agreements",
        "Gyan.FFmpeg",
      ],
      { stdio: "inherit", timeout: 5 * 60 * 1000 }
    );
    if (res.error) {
      console.warn(`[ffmpeg] winget invocation failed: ${res.error.message}`);
    }
    // re-check PATH and install dirs
    if (tryFfmpegAt("ffmpeg")) return "ffmpeg";
    found = await findInstalledFfmpeg();
    if (found) return found;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Image processing
// ---------------------------------------------------------------------------

async function processImages() {
  await fs.mkdir(IMG_OUT, { recursive: true });
  const all = await fs.readdir(SRC_DIR);
  const files = all.filter((f) => /\.jpe?g$/i.test(f)).sort();

  const results = [];
  for (const file of files) {
    const basename = path.basename(file, path.extname(file));
    const srcPath = path.join(SRC_DIR, file);
    const meta = await sharp(srcPath).metadata();
    // metadata.width/height are pre-rotation; account for EXIF orientation.
    const orientation = meta.orientation ?? 1;
    const swap = orientation >= 5; // 5..8 imply a 90deg rotation
    const srcWidth = swap ? meta.height : meta.width;

    for (const w of IMAGE_WIDTHS) {
      if (srcWidth && w > srcWidth) continue; // no upscaling
      const outPath = path.join(IMG_OUT, `${basename}-${w}.webp`);
      await sharp(srcPath)
        .rotate() // auto-applies EXIF orientation
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outPath);
      results.push({ basename, width: w, size: await sizeOf(outPath) });
    }
  }
  return { files, results };
}

// ---------------------------------------------------------------------------
// Video processing
// ---------------------------------------------------------------------------

async function processVideos(ffmpeg) {
  await fs.mkdir(VID_OUT, { recursive: true });
  const all = await fs.readdir(SRC_DIR);
  const files = all.filter((f) => /\.mov$/i.test(f)).sort();

  const SCALE = "scale='min(1920,iw)':-2";
  const outputs = [];

  for (const file of files) {
    const basename = path.basename(file, path.extname(file));
    const srcPath = path.join(SRC_DIR, file);
    const mp4 = path.join(VID_OUT, `${basename}.mp4`);
    const webm = path.join(VID_OUT, `${basename}.webm`);
    const poster = path.join(VID_OUT, `${basename}-poster.webp`);

    console.log(`[video] ${file} -> mp4...`);
    await execFileAsync(ffmpeg, [
      "-y", "-i", srcPath,
      "-c:v", "libx264", "-crf", "24", "-preset", "veryfast",
      "-movflags", "+faststart", "-an",
      "-vf", SCALE,
      mp4,
    ]);

    console.log(`[video] ${file} -> webm...`);
    await execFileAsync(ffmpeg, [
      "-y", "-i", srcPath,
      "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "34", "-an",
      "-vf", SCALE,
      webm,
    ]);

    console.log(`[video] ${file} -> poster...`);
    // Extract a representative frame as PNG to a temp file, then convert via sharp.
    const tmpFrame = path.join(VID_OUT, `${basename}-frame.png`);
    await execFileAsync(ffmpeg, [
      "-y", "-ss", "00:00:01", "-i", srcPath,
      "-frames:v", "1",
      "-vf", SCALE,
      tmpFrame,
    ]);
    await sharp(tmpFrame).webp({ quality: 80 }).toFile(poster);
    await fs.rm(tmpFrame, { force: true });

    outputs.push({
      basename,
      mp4: await sizeOf(mp4),
      webm: await sizeOf(webm),
      poster: await sizeOf(poster),
    });
  }
  return { files, outputs };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Media prep pipeline ===");
  console.log(`Source: ${SRC_DIR}`);

  // Images first (always run).
  console.log("\n--- Processing images ---");
  const img = await processImages();
  const imgTotal = img.results.reduce((a, r) => a + r.size, 0);
  console.log(
    `Images: ${img.files.length} source files -> ${img.results.length} webp variants (${fmtBytes(imgTotal)} total)`
  );

  // Videos.
  console.log("\n--- Locating ffmpeg ---");
  const ffmpeg = await ensureFfmpeg();
  let vid = null;
  if (!ffmpeg) {
    console.warn(
      "\n[WARNING] ffmpeg is not available and could not be installed.\n" +
        "          Video transcoding was SKIPPED. Images were still processed.\n" +
        "          The page can use poster images as a fallback until videos are generated.\n"
    );
  } else {
    console.log(`ffmpeg: ${ffmpeg}`);
    console.log("\n--- Processing videos ---");
    vid = await processVideos(ffmpeg);
  }

  // Summary
  console.log("\n=== Summary ===");
  console.log(`Image source files: ${img.files.length}`);
  console.log(`Image webp variants written: ${img.results.length} (${fmtBytes(imgTotal)})`);
  if (vid) {
    console.log(`Video source files: ${vid.files.length}`);
    for (const o of vid.outputs) {
      console.log(
        `  ${o.basename}: mp4 ${fmtBytes(o.mp4)} | webm ${fmtBytes(o.webm)} | poster ${fmtBytes(o.poster)}`
      );
    }
  } else {
    console.log("Videos: SKIPPED (ffmpeg unavailable)");
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("[FATAL]", err);
  process.exit(1);
});
