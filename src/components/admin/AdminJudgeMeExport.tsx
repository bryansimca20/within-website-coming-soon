import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminJudgeMeExportProps {
  /** Reviews the file will hold: shared or notice-era, from a real box, with stars and words. */
  shareable: number;
}

/** Downloads the shareable reviews as a Judge.me import file, for one product handle or the store as a whole. */
export function AdminJudgeMeExport({ shareable }: AdminJudgeMeExportProps) {
  return (
    <section aria-labelledby="judgeme-export" className="flex flex-col gap-4 rounded-[var(--wi-radius-card)] bg-wi-paper p-5 shadow-[var(--wi-shadow-card)]">
      <div className="flex flex-col gap-0.5">
        <h2 id="judgeme-export" className="m-0 text-body font-semibold text-wi-black">
          Export for Judge.me <span className="ml-1 rounded-full bg-wi-mist px-2 py-0.5 align-middle text-xs font-medium text-wi-ink-500 tabular-nums">{shareable} rows</span>
        </h2>
        <p className="m-0 max-w-[65ch] text-sm text-wi-ink-500">
          Reviews samplers agreed to share, plus those written under the earlier notice. Each one imports into Judge.me&apos;s &quot;To curate&quot; queue, so read it there before it goes live. Import it in Judge.me as a &quot;Judge.me format&quot; file: other import options may publish reviews straight away.
        </p>
      </div>
      <form method="get" action="/admin/reviews/export/judgeme" className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-56 flex-col gap-1.5">
          <Label htmlFor="judgeme-handle">Shopify product handle</Label>
          <Input id="judgeme-handle" name="handle" placeholder="Blank for store reviews" autoComplete="off" spellCheck={false}
            pattern="[a-z0-9]+(-[a-z0-9]+)*" title="Lowercase letters, numbers and single hyphens, as in the product URL" className="bg-wi-paper" />
        </div>
        <Button type="submit" size="sm" variant="secondary">Download CSV</Button>
      </form>
    </section>
  );
}
