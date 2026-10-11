import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { WAITLIST_COPY } from "@/components/waitlist/utils/waitlist-copy";

export const alt = "WITHIN electrolyte sachet. Take back what you lose in the heat.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Reads a shipped PNG into a data URL, the only image source Satori can embed at build time. */
async function readPublicPng(path: string): Promise<string> {
  const data = await readFile(join(process.cwd(), "public", path));

  return `data:image/png;base64,${data.toString("base64")}`;
}

/**
 * Social share card: the sachet on white beside the headline, under the logotype.
 * ImageResponse (Satori) only accepts inline styles, so this is not a UI component.
 */
export default async function OpengraphImage() {
  const [logotype, sachet] = await Promise.all([
    readPublicPng("brand/within-logotype.png"),
    readPublicPng("waitlist/sachet-og.png"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 96px",
          background: "#ffffff",
          color: "#191919",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 660 }}>
          <img src={logotype} width={177} height={32} alt="" />
          <div
            style={{
              marginTop: 56,
              fontSize: 76,
              lineHeight: 1,
              letterSpacing: "-2px",
            }}
          >
            {WAITLIST_COPY.headline}
          </div>
          <div style={{ display: "flex", marginTop: 48 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: 64,
                padding: "0 28px",
                background: "#ff8326",
                fontSize: 26,
                fontWeight: 600,
              }}
            >
              {WAITLIST_COPY.cta}
            </div>
          </div>
        </div>
        <img src={sachet} width={236} height={510} alt="" />
      </div>
    ),
    { ...size }
  );
}
