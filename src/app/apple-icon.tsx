import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon: the WITHIN logomark on paper. ImageResponse (Satori) only
 * accepts inline styles and rasterizes the shipped PNG — not a UI component.
 */
export default async function AppleIcon() {
  const data = await readFile(join(process.cwd(), "public/brand/within-logomark.png"));
  const src = `data:image/png;base64,${data.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <img src={src} width={116} height={69} alt="" />
      </div>
    ),
    { ...size }
  );
}
