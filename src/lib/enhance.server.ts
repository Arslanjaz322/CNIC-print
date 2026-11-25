import { scanOutputSize } from "./scan-size";

// The user's chosen prompt — keep it word for word.
export const SCAN_PROMPT =
  "Convert this image into a clean, high-contrast CamScanner-style document scan. Flatten and crop tightly to the card edges with a clean white or light background, remove shadows and glare, sharpen text and fine details, balance lighting evenly, and keep all text, numbers, signatures, and details completely accurate and unaltered.";

export type ScanResult = { image: string | null; error: string | null };

export async function runScanEnhance(dataUrl: string, width: number, height: number): Promise<ScanResult> {
  if (!/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(dataUrl)) {
    return { image: null, error: "Unsupported image" };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return { image: null, error: "OPENROUTER_API_KEY is not set on the server" };
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-image-2.6-flare";

  try {
    const res = await fetch("https://openrouter.ai/api/v1/images", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: SCAN_PROMPT,
        input_references: [{ type: "image_url", image_url: { url: dataUrl } }],
        size: scanOutputSize(width, height),
        quality: "medium",
        output_format: "jpeg",
        output_compression: 92,
        response_format: "b64_json",
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error("scan enhance failed", res.status, detail);
      let msg = detail.slice(0, 160);
      try {
        msg = (JSON.parse(detail) as { error?: { message?: string } }).error?.message ?? msg;
      } catch {}
      if (res.status === 402) return { image: null, error: "OpenRouter credits have run out" };
      if (res.status === 429) return { image: null, error: "too many requests, try again shortly" };
      if (res.status === 401 || res.status === 403) return { image: null, error: "OpenRouter key was rejected" };
      return { image: null, error: `OpenRouter ${res.status}: ${msg}` };
    }
    const json = (await res.json()) as { data?: { b64_json?: string; media_type?: string }[] };
    const item = json.data?.[0];
    if (!item?.b64_json) return { image: null, error: "AI returned no image" };
    return { image: `data:${item.media_type ?? "image/jpeg"};base64,${item.b64_json}`, error: null };
  } catch (e) {
    console.error("scan enhance failed", e);
    return { image: null, error: "AI enhance failed" };
  }
}
