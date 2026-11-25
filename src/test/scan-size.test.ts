import { describe, expect, it } from "vitest";
import { scanOutputSize } from "@/lib/scan-size";

const parse = (s: string) => s.split("x").map(Number) as [number, number];

describe("scanOutputSize", () => {
  it("keeps a landscape card landscape at a 1024 px long edge", () => {
    expect(scanOutputSize(3000, 2000)).toBe("1024x688");
  });
  it("keeps a portrait photo portrait", () => {
    expect(scanOutputSize(1000, 1500)).toBe("688x1024");
  });
  it("clamps very wide images to the 3:1 limit", () => {
    expect(scanOutputSize(5000, 1000)).toBe("1024x640");
  });
  it("falls back to auto for unusable sizes", () => {
    expect(scanOutputSize(0, 100)).toBe("auto");
  });
  it("always returns a size the image model accepts", () => {
    for (const [w, h] of [[856, 540], [4000, 3000], [1, 1], [3840, 100], [720, 1280]] as const) {
      const [a, b] = parse(scanOutputSize(w, h));
      expect(a % 16).toBe(0);
      expect(b % 16).toBe(0);
      expect(Math.max(a, b)).toBeLessThanOrEqual(3840);
      expect(Math.max(a, b) / Math.min(a, b)).toBeLessThanOrEqual(3);
      expect(a * b).toBeGreaterThanOrEqual(655_360);
      expect(a * b).toBeLessThanOrEqual(8_294_400);
    }
  });
});
