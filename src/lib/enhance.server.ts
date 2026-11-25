// The user's chosen prompt — keep it word for word.
export const SCAN_PROMPT =
  "Convert this image into a clean, high-contrast CamScanner-style document scan. Flatten and crop tightly to the card edges with a clean white or light background, remove shadows and glare, sharpen text and fine details, balance lighting evenly, and keep all text, numbers, signatures, and details completely accurate and unaltered.";

export type ScanResult = { image: string | null; error: string | null };

export async function runScanEnhance(dataUrl: string, _width: number, _height: number): Promise<ScanResult> {
  if (!/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(dataUrl)) {
    return { image: null, error: "Unsupported image" };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return { image: null, error: "OPENROUTER_API_KEY is not set on the server" };
  // Any OpenRouter model that accepts image input and can output images.
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-image";

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        modalities: ["image", "text"],
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: SCAN_PROMPT },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });
    if (!res.ok) {
      console.error("scan enhance failed", res.status, await res.text());
      if (res.status === 402) return { image: null, error: "OpenRouter credits have run out" };
      if (res.status === 429) return { image: null, error: "too many requests, try again shortly" };
      if (res.status === 401 || res.status === 403) return { image: null, error: "OpenRouter key was rejected" };
      return { image: null, error: "AI service error" };
    }
    const json = (await res.json()) as {
      choices?: { message?: { images?: { image_url?: { url?: string } }[] } }[];
    };
    const out = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!out || !out.startsWith("data:image/")) return { image: null, error: "AI returned no image" };
    return { image: out, error: null };
  } catch (e) {
    console.error("scan enhance failed", e);
    return { image: null, error: "AI enhance failed" };
  }
}
