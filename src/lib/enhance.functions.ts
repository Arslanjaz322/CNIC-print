import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runScanEnhance } from "./enhance.server";

export const enhanceScan = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        image: z.string().startsWith("data:image/").max(20_000_000),
        width: z.number().int().positive().max(10_000),
        height: z.number().int().positive().max(10_000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => runScanEnhance(data.image, data.width, data.height));
