import { parseRatingParam } from "@/app/utils/sample-feedback-input";
import { SampleFeedbackForm } from "@/components/sample/SampleFeedbackForm";
import { SampleShell } from "@/components/sample/SampleShell";
import { db } from "@/db/client";
import { SampleRequestService } from "@/services/sample-request.service";

export const dynamic = "force-dynamic";

const TOKEN_PATTERN = /^[A-Za-z0-9]{24}$/;

/** The QR landing. With `?code=` from an email it already knows who this is; `?rating=` is the star they tapped there. */
export default async function SampleFeedbackRoute({
  searchParams,
}: {
  searchParams: Promise<{ code?: string | string[]; rating?: string | string[] }>;
}) {
  const { code, rating } = await searchParams;
  const token = typeof code === "string" && TOKEN_PATTERN.test(code) ? code : null;
  const request = token === null ? null : await SampleRequestService.findByToken(db, token);

  return (
    <SampleShell>
      <SampleFeedbackForm code={request === null ? null : token} firstName={request?.firstName ?? null} initialRating={parseRatingParam(rating)} />
    </SampleShell>
  );
}
