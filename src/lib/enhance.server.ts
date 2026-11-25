// The user's chosen prompt — keep it word for word.
export const SCAN_PROMPT =
  "Convert this image into a clean, high-contrast CamScanner-style document scan. Flatten and crop tightly to the card edges with a clean white or light background, remove shadows and glare, sharpen text and fine details, balance lighting evenly, and keep all text, numbers, signatures, and details completely accurate and unaltered.";

export type ScanResult = { image: string | null; error: string | null };

function openAiSize(width: number, height: number): string {
  // gpt-image-1 only accepts 1024x1024, 1536x1024 or 1024x1536.
  const r = width / height;
  if (r > 1.2) return "1536x1024";
  if (r < 0.83) return "1024x1536";
  return "1024x1024";
}

export async function runScanEnhance(dataUrl: string, width: number, height: number): Promise<ScanResult> {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  const type = m?.[1];
  const b64 = m?.[2];
  if (!type || !b64) return { image: null, error: "Unsupported image" };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { image: null, error: "OPENAI_API_KEY is not set on the server" };

  const form = new FormData();
  form.append("model", "gpt-image-1");
  form.append("image", new File([Buffer.from(b64, "base64")], "scan.jpg", { type }));
  form.append("prompt", SCAN_PROMPT);
  form.append("size", openAiSize(width, height));
  form.append("quality", "medium");
  form.append("output_format", "jpeg");
  form.append("output_compression", "92");

  try {
    const res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!res.ok) {
      console.error("scan enhance failed", res.status, await res.text());
      if (res.status === 429) return { image: null, error: "too many requests, try again shortly" };
      if (res.status === 401 || res.status === 403) return { image: null, error: "OpenAI key was rejected or not allowed" };
      return { image: null, error: "AI service error" };
    }
    const json = (await res.json()) as { data?: { b64_json?: string }[] };
    const out = json.data?.[0]?.b64_json;
    if (!out) return { image: null, error: "AI returned no image" };
    return { image: `data:image/jpeg;base64,${out}`, error: null };
  } catch (e) {
    console.error("scan enhance failed", e);
    return { image: null, error: "AI enhance failed" };
  }
}
