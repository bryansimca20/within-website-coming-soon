import type { SamplePageState } from "@/services/sample-request.service";

import { SampleComingSoon } from "./SampleComingSoon";
import { SampleNotice } from "./SampleNotice";
import { SampleRequestForm } from "./SampleRequestForm";
import { SampleShell } from "./SampleShell";
import { SampleSnapScript } from "./SampleSnapScript";

interface SamplePageProps {
  state: SamplePageState;
  snapScriptUrl: string;
}

/** `/sample`: the batch it serves, as coming soon, the intro and five-step request, or the claimed notice. */
export function SamplePage({ state, snapScriptUrl }: SamplePageProps) {
  return (
    <SampleShell isWide={state.kind === "upcoming" || state.kind === "open"}>
      {state.kind === "upcoming" && <SampleComingSoon batch={state.batch} />}
      {state.kind === "open" && (
        <>
          <SampleSnapScript src={snapScriptUrl} />
          <SampleRequestForm batch={state.batch} />
        </>
      )}
      {state.kind === "closed" && <SampleNotice kind="full" batch={state.batch} />}
      {state.kind === "none" && <SampleNotice kind="full" batch={null} />}
    </SampleShell>
  );
}
