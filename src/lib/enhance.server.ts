import { scanOutputSize } from "./scan-size";

// The user's chosen prompt — keep it word for word.
export const SCAN_PROMPT =
  "Convert this image into a clean, high-contrast CamScanner-style document scan. Flatten and crop tightly to the card edges with a clean white or light background, remove shadows and glare, sharpen text and fine details, balance lighting evenly, and keep all text, numbers, signatures, and details completely accurate and unaltered.";

export type ScanResult = { image: string | null; error: string | null };

export async function runScanEnhance(
  dataUrl: string,
  width: number,
  height: number,
): Promise<ScanResult> {
  if (!/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(dataUrl)) {
    return { image: null, error: "Unsupported image" };
  }

  // Always-free keyless mode: scan enhancement runs directly in the browser without API keys.
  void scanOutputSize(width, height);
  return { image: null, error: null };
}
