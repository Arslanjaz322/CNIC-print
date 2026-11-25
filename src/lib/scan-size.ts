// Output size for the AI scan clean-up. The image model needs each edge to be a multiple
// of 16, at most 3840, an aspect ratio of at most 3:1 and 655,360–8,294,400 pixels.
// 1024 keeps the AI step as short as possible per photo; the browser upscales to 4K afterwards.
export const SCAN_LONG_EDGE = 1024;

const round16 = (n: number) => Math.round(n / 16) * 16;

export function scanOutputSize(width: number, height: number): string {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return "auto";
  const ratio = Math.min(3, Math.max(width, height) / Math.min(width, height));
  const long = SCAN_LONG_EDGE;
  // 640 keeps 1024 × short at the 655,360 pixel minimum.
  const short = Math.min(long, Math.max(640, round16(long / ratio)));
  return width >= height ? `${long}x${short}` : `${short}x${long}`;
}
