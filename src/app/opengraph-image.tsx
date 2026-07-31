import { ImageResponse } from "next/og";

export const alt = "WITHIN - Coming soon";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social share card: black field, the WITHIN wordmark, a "coming soon" line.
 * ImageResponse (Satori) only accepts inline styles — this is not a UI component.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0d12",
        }}
      >
        <div style={{ fontSize: 172, fontWeight: 800, letterSpacing: "-8px", color: "#ffffff" }}>
          WITHIN
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: "16px",
            color: "#9aa3b2",
          }}
        >
          COMING SOON
        </div>
      </div>
    ),
    { ...size }
  );
}
