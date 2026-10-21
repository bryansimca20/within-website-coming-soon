import { SampleDevDataToggle } from "./SampleDevDataToggle";
import { SampleNotice } from "./SampleNotice";
import { SampleRequestForm } from "./SampleRequestForm";
import { SampleShell } from "./SampleShell";
import { SampleSnapScript } from "./SampleSnapScript";

interface SamplePageProps {
  /** Null when no batch is open. */
  claimed: number | null;
  capacity: number;
  snapScriptUrl: string;
}

/** `/sample`: the intro and the five-step request, or the closed notice once the batch is claimed. */
export function SamplePage({ claimed, capacity, snapScriptUrl }: SamplePageProps) {
  const isOpen = claimed !== null && claimed < capacity;

  return (
    <SampleShell isWide={isOpen}>
      {isOpen ? (
        <>
          <SampleSnapScript src={snapScriptUrl} />
          <SampleRequestForm />
          <SampleDevDataToggle />
        </>
      ) : (
        <SampleNotice kind="full" />
      )}
    </SampleShell>
  );
}
