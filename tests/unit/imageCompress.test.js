import { describe, it, expect } from "vitest";
import {
  computeTargetDimensions,
  shouldSkipCompression,
  toJpegName,
  fileToDataUrl,
  compressImage,
  DEFAULT_MAX_DIMENSION,
  MIN_COMPRESS_BYTES,
} from "@/lib/imageCompress";

const makeFile = (bytes, type = "image/jpeg", name = "photo.jpg") => {
  // A File of approximately `bytes` length — content is irrelevant to the
  // pure helpers and to the jsdom fallback path (canvas is unavailable there).
  const blob = new Blob([new Uint8Array(Math.max(0, bytes))], { type });
  return new File([blob], name, { type });
};

describe("computeTargetDimensions", () => {
  it("leaves images already within the cap untouched", () => {
    expect(computeTargetDimensions(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });

  it("scales the longest side down to the cap, preserving aspect ratio", () => {
    expect(computeTargetDimensions(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
  });

  it("caps by height when the image is portrait", () => {
    expect(computeTargetDimensions(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 });
  });

  it("defaults the cap to DEFAULT_MAX_DIMENSION", () => {
    const { width } = computeTargetDimensions(DEFAULT_MAX_DIMENSION * 2, DEFAULT_MAX_DIMENSION * 2);
    expect(width).toBe(DEFAULT_MAX_DIMENSION);
  });

  it("returns zeros for degenerate input", () => {
    expect(computeTargetDimensions(0, 0)).toEqual({ width: 0, height: 0 });
    expect(computeTargetDimensions(-10, 100)).toEqual({ width: 0, height: 0 });
  });
});

describe("shouldSkipCompression", () => {
  it("skips non-files and non-images", () => {
    expect(shouldSkipCompression(null)).toBe(true);
    expect(shouldSkipCompression(makeFile(MIN_COMPRESS_BYTES + 1, "application/pdf"))).toBe(true);
  });

  it("skips animated/vector formats we must not rasterize", () => {
    expect(shouldSkipCompression(makeFile(MIN_COMPRESS_BYTES + 1, "image/gif"))).toBe(true);
    expect(shouldSkipCompression(makeFile(MIN_COMPRESS_BYTES + 1, "image/svg+xml"))).toBe(true);
  });

  it("skips files already under the size threshold", () => {
    expect(shouldSkipCompression(makeFile(MIN_COMPRESS_BYTES - 1, "image/jpeg"))).toBe(true);
  });

  it("compresses large raster photos", () => {
    expect(shouldSkipCompression(makeFile(MIN_COMPRESS_BYTES + 1, "image/jpeg"))).toBe(false);
    expect(shouldSkipCompression(makeFile(MIN_COMPRESS_BYTES + 1, "image/png"))).toBe(false);
  });
});

describe("toJpegName", () => {
  it("swaps any extension for .jpg", () => {
    expect(toJpegName("IMG_1234.HEIC")).toBe("IMG_1234.jpg");
    expect(toJpegName("cover.png")).toBe("cover.jpg");
  });

  it("appends .jpg when there is no extension", () => {
    expect(toJpegName("scan")).toBe("scan.jpg");
  });

  it("falls back to a safe name for empty/invalid input", () => {
    expect(toJpegName("")).toBe("photo.jpg");
    expect(toJpegName(undefined)).toBe("photo.jpg");
  });
});

describe("fileToDataUrl", () => {
  it("reads a file into a data URL", async () => {
    const url = await fileToDataUrl(makeFile(8, "image/jpeg"));
    expect(typeof url).toBe("string");
    expect(url.startsWith("data:")).toBe(true);
  });
});

describe("compressImage (fallback safety)", () => {
  it("returns the original file when it is below the threshold", async () => {
    const small = makeFile(MIN_COMPRESS_BYTES - 1, "image/jpeg");
    expect(await compressImage(small)).toBe(small);
  });

  it("never throws and returns a File even when canvas is unavailable (jsdom)", async () => {
    // jsdom has no real canvas/createImageBitmap, so the browser path fails and
    // compressImage must fall back to the original file rather than reject.
    const large = makeFile(MIN_COMPRESS_BYTES + 1024, "image/jpeg");
    const result = await compressImage(large);
    expect(result).toBe(large);
  });
});
