import type { NextRequest } from "next/server";

import { parseProductHandle } from "@/app/utils/product-handle";
import { db } from "@/db/client";
import { isAdmin } from "@/lib/admin-session";
import { buildJudgeMeCsv, JudgeMeExportService } from "@/services/judgeme-export.service";

import { csvResponse } from "../../../batches/[batchId]/export/utils/csv-response";

/** Downloads every shareable review in Judge.me's import format, for one product handle or as store reviews. */
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return new Response(null, { status: 401 });
  }
  const handle = parseProductHandle(request.nextUrl.searchParams.get("handle"));

  return csvResponse(buildJudgeMeCsv(await JudgeMeExportService.load(db), handle), "within-judgeme-reviews.csv");
}
