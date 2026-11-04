import Link from "next/link";

import { formatJakarta } from "@/components/sample/utils/jakarta-date";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SampleFeedbackRow, SampleRequest } from "@/db/schema";

import { AdminStars } from "./AdminStars";

interface AdminSeededListProps {
  requests: SampleRequest[];
  feedback: Map<string, SampleFeedbackRow>;
  /** Shown when a check-in filter leaves nothing, instead of the nothing-seeded line. */
  isFiltered: boolean;
}

/** Everyone handed a sample in person: contact, when, and whether they checked in. No fee or address, there is no delivery. */
export function AdminSeededList({ requests, feedback, isFiltered }: AdminSeededListProps) {
  if (requests.length === 0) {
    return (
      <p className="m-0 rounded-[var(--wi-radius-card)] bg-wi-paper p-6 text-sm text-wi-ink-500 shadow-[var(--wi-shadow-card)]">
        {isFiltered ? "No one matches this filter." : "Nothing seeded yet. Use Seed a sample on your phone."}
      </p>
    );
  }

  return (
    <div className="rounded-[var(--wi-radius-card)] bg-wi-paper px-2 py-1 shadow-[var(--wi-shadow-card)]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Instagram</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Stars</TableHead>
            <TableHead>Headline</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => {
            const checkIn = feedback.get(request.id);

            return (
              <TableRow key={request.id}>
                <TableCell>
                  <Link href={`/admin/requests/${request.id}`} className="font-medium text-wi-black hover:underline">{request.fullName}</Link>
                </TableCell>
                <TableCell>
                  <a href={`https://instagram.com/${request.instagramHandle}`} target="_blank" rel="noreferrer" className="text-wi-ink-700 hover:text-wi-black hover:underline">@{request.instagramHandle}</a>
                </TableCell>
                <TableCell className="tabular-nums">{request.whatsapp}</TableCell>
                <TableCell className="tabular-nums">{formatJakarta(request.createdAt)}</TableCell>
                <TableCell>{checkIn === undefined ? <span className="text-wi-ink-500">None</span> : "Reviewed"}</TableCell>
                <TableCell>{checkIn?.rating == null ? "" : <AdminStars value={checkIn.rating} />}</TableCell>
                <TableCell className="max-w-56 truncate">{checkIn?.headline ?? ""}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
