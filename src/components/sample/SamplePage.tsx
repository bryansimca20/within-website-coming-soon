import { SampleNotice } from "./SampleNotice";
import { SampleRequestForm } from "./SampleRequestForm";
import { SampleShell } from "./SampleShell";
import { SampleSnapScript } from "./SampleSnapScript";
import { formatClaimed, SAMPLE_COPY } from "./utils/sample-copy";

interface SamplePageProps {
  /** Null when no batch is open. */
  claimed: number | null;
  capacity: number;
  snapScriptUrl: string;
}

/** `/sample`: the limited-batch intro and the request form, or the closed notice. */
export function SamplePage({ claimed, capacity, snapScriptUrl }: SamplePageProps) {
  const isOpen = claimed !== null && claimed < capacity;

  return (
    <SampleShell>
      <div className="flex flex-col gap-3 pb-8">
        <p className="m-0 text-xs leading-4 font-bold tracking-[0.06em] text-brand-muted">{SAMPLE_COPY.batchLabel}</p>
        <h1 className="m-0 text-[32px] leading-9 font-normal tracking-[-0.02em] desk:text-[44px] desk:leading-[48px]">
          {SAMPLE_COPY.headline}
        </h1>
        <p className="m-0 text-[17px] leading-[26px] text-pretty">{SAMPLE_COPY.trade}</p>
        {claimed !== null && (
          <p className="m-0 text-sm leading-5 font-semibold tabular-nums">{formatClaimed(Math.min(claimed, capacity), capacity)}</p>
        )}
        {isOpen && <p className="m-0 text-sm leading-5 text-brand-muted">{SAMPLE_COPY.shippingHint}</p>}
      </div>
      {isOpen ? (
        <>
          <SampleSnapScript src={snapScriptUrl} />
          <SampleRequestForm />
        </>
      ) : (
        <SampleNotice kind="full" />
      )}
    </SampleShell>
  );
}
