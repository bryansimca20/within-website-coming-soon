import { WhatsappLogo } from "@phosphor-icons/react/ssr";

import { WaitlistArrowGlyph } from "@/components/waitlist/svg/WaitlistGlyphs";

import { SampleCopyButton } from "./SampleCopyButton";
import { SAMPLE_COPY } from "./utils/sample-copy";

const { transfer } = SAMPLE_COPY;

const LABEL_CLASS = "m-0 text-xs leading-4 font-bold tracking-[0.06em] text-brand-muted";

interface SampleTransferProofProps {
  code: string;
  /** The WhatsApp chat with the message filled in. Null until the founder's number is set, so no dead button shows. */
  proofUrl: string | null;
}

/** Step 2 of a bank transfer: send the screenshot on WhatsApp. The box is held until a founder confirms. */
export function SampleTransferProof({ code, proofUrl }: SampleTransferProofProps) {
  return (
    <section className="mb-10 flex flex-col gap-5 border-t-[6px] border-brand-ink pt-5">
      <p className="m-0 text-[17px] leading-[26px] text-pretty">{transfer.proofBody}</p>
      {proofUrl !== null && (
        <a
          href={proofUrl}
          target="_blank"
          rel="noopener"
          className="flex h-14 items-center justify-between bg-brand-ink px-5 text-base font-semibold text-brand-mist no-underline transition-transform duration-150 ease-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-[0.97] motion-reduce:transition-none"
        >
          <span className="flex items-center gap-2.5">
            <WhatsappLogo aria-hidden weight="bold" className="size-5" />
            {transfer.proofCta}
          </span>
          <WaitlistArrowGlyph />
        </a>
      )}
      <div className="flex items-center justify-between gap-3 bg-brand-mist py-3 pr-3 pl-5">
        <div className="flex flex-col gap-1">
          <p className={LABEL_CLASS}>{transfer.yourCode}</p>
          <span className="text-[22px] leading-7 font-semibold tracking-[0.12em] tabular-nums select-all">{code}</span>
        </div>
        <SampleCopyButton value={code} what={transfer.codeWhat} />
      </div>
      <p className="m-0 text-[15px] leading-[22px] text-brand-muted">{transfer.promise}</p>
    </section>
  );
}
