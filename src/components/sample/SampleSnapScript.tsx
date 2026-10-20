import Script from "next/script";

interface SampleSnapScriptProps {
  /** snap.js for the active Midtrans environment, computed on the server. */
  src: string;
}

/** Loads Midtrans snap.js with the public client key. Only on pages that take payment. */
export function SampleSnapScript({ src }: SampleSnapScriptProps) {
  return (
    <Script
      src={src}
      data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ""}
      strategy="afterInteractive"
    />
  );
}
