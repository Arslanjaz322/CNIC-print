import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";

import { TOOL_MARKUP } from "@/components/print-tool/markup";
import { enhanceScan } from "@/lib/enhance.functions";

type ScanInput = { image: string; width: number; height: number };

declare global {
  interface Window {
    cnicAiEnhance?: (input: ScanInput) => Promise<string>;
  }
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CNIC & Photo Print — scan, lay out and print ID cards" },
      {
        name: "description",
        content:
          "Lay out CNIC cards and photos on A4 or photo paper, clean them up with AI scanner-style enhance, and print at full quality.",
      },
      { property: "og:title", content: "CNIC & Photo Print" },
      {
        property: "og:description",
        content: "Scan-style AI clean-up, layouts for CNIC and photos, and print-ready pages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const enhance = useServerFn(enhanceScan);

  useEffect(() => {
    // Bridge for the print tool script: it hands over a photo, the server runs the AI scan clean-up.
    window.cnicAiEnhance = async (input) => {
      const r = await enhance({ data: input });
      if (!r.image) throw new Error(r.error ?? "AI enhance failed");
      return r.image;
    };
    if (!document.getElementById("print-tool-script")) {
      const s = document.createElement("script");
      s.id = "print-tool-script";
      s.src = "/print-tool/tool.js";
      document.body.append(s);
    }
  }, [enhance]);

  return <div id="app" dangerouslySetInnerHTML={{ __html: TOOL_MARKUP }} />;
}
