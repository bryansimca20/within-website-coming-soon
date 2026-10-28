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

/** `/sample`: coming soon before the batch opens, the intro and five-step request while it's open, the claimed notice after. */
export function SamplePage({ state, snapScriptUrl }: SamplePageProps) {
  return (
    <SampleShell isWide={state.kind !== "closed"}>
      {state.kind === "upcoming" && <SampleComingSoon />}
      {state.kind === "open" && (
        <>
          <SampleSnapScript src={snapScriptUrl} />
          <SampleRequestForm />
        </>
      )}
      {state.kind === "closed" && <SampleNotice kind="full" />}
    </SampleShell>
  );
}
