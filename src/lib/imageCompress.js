/**
 * Client-side image downscale + re-encode, run before a photo is uploaded.
 *
 * Why this exists — the book-create flow hung ("zagruzka bo'lib qoladi") because
 * the browser uploaded the raw phone photo (4–12 MB) and the backend then
 * resized it *synchronously* in-request (Pillow `ResizedImageField`, 800×800).
 * On a mobile connection the upload alone blew past the 20s axios timeout, the
 * spinner appeared to hang, and a retry created a duplicate book.
 *
 * Shrinking the file in the browser (≈8 MB → ≈300 KB) makes the upload near
 * instant and cuts the backend's CPU work, so the whole round-trip finishes
 * well inside the timeout. The backend still re-resizes to 800×800, so we only
 * need a "good enough" source — 1600px keeps it sharp at that target.
 *
 * Design rules:
 *   - NEVER block the user. Any failure (decode, canvas, unsupported env)
 *     falls back to the original File so the post still goes through.
 *   - Skip files that won't benefit (small, non-raster, animated GIF, SVG).
 *   - Pure geometry/skip helpers are exported for unit tests; the canvas path
 *     is browser-only and guarded behind a `window` check.
 */

export const DEFAULT_MAX_DIMENSION = 1600;
export const DEFAULT_QUALITY = 0.82;
// Files below this are already cheap to upload and cheap for the backend to
// resize — the canvas round-trip would only add latency, so skip it.
export const MIN_COMPRESS_BYTES = 256 * 1024; // 256 KB

/**
 * Target [width, height] that fits inside `maxDimension` on its longest side
 * while preserving aspect ratio. Returns the source size unchanged when it's
 * already small enough. Pure — safe to unit-test.
 */
export function computeTargetDimensions(width, height, maxDimension = DEFAULT_MAX_DIMENSION) {
  if (!width || !height || width < 0 || height < 0) return { width: 0, height: 0 };
  const longest = Math.max(width, height);
  if (longest <= maxDimension) {
    return { width: Math.round(width), height: Math.round(height) };
  }
  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/**
 * Should we leave this file untouched? True for non-images, animated/vector
 * formats we must not rasterize, and files already under `minBytes`. Pure.
 */
export function shouldSkipCompression(file, minBytes = MIN_COMPRESS_BYTES) {
  if (!file || typeof file !== "object") return true;
  const type = file.type || "";
  if (!type.startsWith("image/")) return true;
  // GIF can be animated (flattening kills the animation); SVG is vector and
  // re-rasterizing is lossy and pointless. Leave both alone.
  if (type === "image/gif" || type === "image/svg+xml") return true;
  if (typeof file.size === "number" && file.size < minBytes) return true;
  return false;
}

/** Swap any extension for `.jpg` (canvas re-encodes to JPEG). */
export function toJpegName(name) {
  if (!name || typeof name !== "string") return "photo.jpg";
  const base = name.replace(/\.[^./\\]+$/, "");
  return `${base || "photo"}.jpg`;
}

/** Read a File/Blob into a data URL (used for the in-modal preview). */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => resolve(ev.target?.result ?? null);
    reader.onerror = () => reject(reader.error || new Error("file read failed"));
    reader.readAsDataURL(file);
  });
}

// --- Browser-only decoding ---------------------------------------------------

function decodeViaImg(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image decode failed"));
    };
    img.src = url;
    // Caller revokes after draw via the returned object's `_objectUrl`.
    img._objectUrl = url;
  });
}

async function decode(file) {
  // createImageBitmap is faster and, with `imageOrientation: "from-image"`,
  // bakes in EXIF rotation so portrait phone photos aren't drawn sideways.
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* Safari/older: fall back to <img>, which also honours EXIF orientation. */
    }
  }
  return decodeViaImg(file);
}

function releaseSource(source) {
  if (!source) return;
  if (typeof source.close === "function") source.close(); // ImageBitmap
  if (source._objectUrl) URL.revokeObjectURL(source._objectUrl); // <img> fallback
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    if (typeof canvas.toBlob === "function") {
      canvas.toBlob((blob) => resolve(blob), type, quality);
      return;
    }
    resolve(null);
  });
}

/**
 * Downscale + re-encode `file` to JPEG. Resolves to a smaller File on success,
 * or the ORIGINAL file on any skip/failure — callers can always upload the
 * result without checking which branch they got.
 */
export async function compressImage(file, opts = {}) {
  const {
    maxDimension = DEFAULT_MAX_DIMENSION,
    quality = DEFAULT_QUALITY,
    minBytes = MIN_COMPRESS_BYTES,
  } = opts;

  if (typeof window === "undefined" || typeof document === "undefined") return file;
  if (shouldSkipCompression(file, minBytes)) return file;

  let source;
  try {
    source = await decode(file);
    const { width, height } = computeTargetDimensions(source.width, source.height, maxDimension);
    if (!width || !height) return file;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(source, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, "image/jpeg", quality);
    // No win (e.g. an already-optimized JPEG) — keep the original bytes.
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], toJpegName(file.name), {
      type: "image/jpeg",
      lastModified: file.lastModified || Date.now(),
    });
  } catch {
    return file;
  } finally {
    releaseSource(source);
  }
}
