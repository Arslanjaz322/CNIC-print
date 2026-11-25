import {
  editImage,
  GatewayError,
  PaymentRequiredError,
  PermissionDeniedError,
  RateLimitError,
} from "@lovable.dev/ai-gateway";
import { scanOutputSize } from "./scan-size";

// The user's chosen prompt — keep it word for word.
export const SCAN_PROMPT =
  "Convert this image into a clean, high-contrast CamScanner-style document scan. Flatten and crop tightly to the card edges with a clean white or light background, remove shadows and glare, sharpen text and fine details, balance lighting evenly, and keep all text, numbers, signatures, and details completely accurate and unaltered.";

export type ScanResult = { image: string | null; error: string | null };

export async function runScanEnhance(dataUrl: string, width: number, height: number): Promise<ScanResult> {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  const type = m?.[1];
  const b64 = m?.[2];
  if (!type || !b64) return { image: null, error: "Unsupported image" };

  const file = new File([Buffer.from(b64, "base64")], "scan.jpg", { type });
  try {
    const res = await editImage({
      model: "openai/gpt-image-2.6-flare",
      image: file,
      prompt: SCAN_PROMPT,
      size: scanOutputSize(width, height),
      quality: "medium",
      output_format: "jpeg",
      output_compression: 92,
    });
    const out = res.data?.[0]?.b64_json;
    if (!out) return { image: null, error: "AI returned no image" };
    return { image: `data:image/jpeg;base64,${out}`, error: null };
  } catch (e) {
    console.error("scan enhance failed", e);
    if (e instanceof PaymentRequiredError) return { image: null, error: "AI credits have run out" };
    if (e instanceof RateLimitError) return { image: null, error: "too many requests, try again shortly" };
    if (e instanceof PermissionDeniedError) return { image: null, error: "AI access is not allowed for this workspace" };
    if (e instanceof GatewayError) return { image: null, error: "AI service error" };
    return { image: null, error: "AI enhance failed" };
  }
}
