import "server-only";

import { inArray } from "drizzle-orm";

import type { SampleDatabase } from "@/db/database";
import { type SampleRequest, sampleRequests, type SampleShipment } from "@/db/schema";

import { BITESHIP_STATUS_LABEL, phaseForBiteshipStatus, ShipmentPhase } from "./biteship.service";
import { SampleAdminDataService } from "./sample-admin-data.service";
import { SampleRequestService } from "./sample-request.service";

/** Where a shipped box stands, as the admin overview groups it. */
export enum DeliveryState {
  Moving = "moving",
  Stuck = "stuck",
  Failed = "failed",
  Delivered = "delivered",
}

/** A box on its way with no courier scan for this long is flagged as stuck. */
export const STUCK_AFTER_DAYS = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

/** One delivery a founder should look at: it failed, or it stopped moving. */
export interface IDeliveryIssue {
  requestId: string;
  boxLabel: string;
  name: string;
  /** The service the sampler picked, such as "JNE REG". */
  courier: string;
  waybillId: string | null;
  trackingLink: string | null;
  state: DeliveryState.Failed | DeliveryState.Stuck;
  /** "Returned to sender", or "No movement in 6 days" for a stuck box. */
  statusLabel: string;
  /** The courier's own words from the latest scan, when it left any. */
  courierNote: string | null;
  lastMovedAt: Date;
}

/** Per-batch delivery counts. In transit includes stuck; failed is the latest attempt only. */
export interface IDeliveryCounts {
  inTransit: number;
  stuck: number;
  failed: number;
  delivered: number;
}

/** Everything the overview and sidebar need about deliveries. */
export interface IDeliveryBoard {
  /** Failed first, then stuck; oldest movement first within each. */
  issues: IDeliveryIssue[];
  byBatch: Record<string, IDeliveryCounts>;
}

interface IHistoryEntry {
  note: string;
  at: Date;
}

/** Reads the stored Biteship history defensively: it is jsonb, written from an external payload. */
function readHistory(history: unknown): IHistoryEntry[] {
  if (!Array.isArray(history)) return [];

  return history.flatMap((entry) => {
    const record = typeof entry === "object" && entry !== null ? (entry as Record<string, unknown>) : {};
    const at = new Date(typeof record.updatedAt === "string" ? record.updatedAt : "");
    return Number.isNaN(at.getTime()) ? [] : [{ note: typeof record.note === "string" ? record.note.trim() : "", at }];
  });
}

function emptyCounts(): IDeliveryCounts {
  return { inTransit: 0, stuck: 0, failed: 0, delivered: 0 };
}

/** Sorts boxes into moving, stuck, failed and delivered, and lists the ones that need a founder. */
export function buildDeliveryBoard(entries: Array<{ request: SampleRequest; shipment: SampleShipment | null }>, now: Date): IDeliveryBoard {
  const issues: IDeliveryIssue[] = [];
  const byBatch: Record<string, IDeliveryCounts> = {};

  for (const { request, shipment } of entries) {
    const counts = (byBatch[request.batchId] ??= emptyCounts());
    const phase = shipment === null ? null : phaseForBiteshipStatus(shipment.status);
    if (request.status === "delivered" || phase === ShipmentPhase.Delivered) {
      counts.delivered += 1;
      continue;
    }
    if (shipment === null) continue;
    // Booked and waiting for pickup: not moving yet, and not a problem.
    if (request.status === "paid" && phase === ShipmentPhase.Booked) continue;

    const history = readHistory(shipment.history).sort((a, b) => b.at.getTime() - a.at.getTime());
    const lastMovedAt = history[0]?.at ?? shipment.updatedAt;
    const courierNote = history.find((entry) => entry.note !== "")?.note ?? null;
    const idleDays = Math.floor((now.getTime() - lastMovedAt.getTime()) / DAY_MS);
    const isFailed = phase === ShipmentPhase.Attention;
    const isStuck = phase === ShipmentPhase.Shipped && idleDays >= STUCK_AFTER_DAYS;

    if (isFailed) counts.failed += 1;
    else counts.inTransit += 1;
    if (isStuck) counts.stuck += 1;
    if (!isFailed && !isStuck) continue;

    issues.push({
      requestId: request.id,
      boxLabel: SampleRequestService.boxLabel(request.batchId, request.boxNumber),
      name: request.fullName,
      courier: request.courierServiceName,
      waybillId: shipment.waybillId,
      trackingLink: shipment.trackingLink,
      state: isFailed ? DeliveryState.Failed : DeliveryState.Stuck,
      statusLabel: isFailed ? (BITESHIP_STATUS_LABEL[shipment.status] ?? shipment.status) : `No movement in ${idleDays} days`,
      courierNote,
      lastMovedAt,
    });
  }

  const rank = (issue: IDeliveryIssue) => (issue.state === DeliveryState.Failed ? 0 : 1);
  issues.sort((a, b) => rank(a) - rank(b) || a.lastMovedAt.getTime() - b.lastMovedAt.getTime());

  return { issues, byBatch };
}

/** Delivery tracking for the admin overview: every paid or later box and its latest attempt. Paid is here for orders that fail before pickup. */
export class SampleDeliveryService {
  static async board(db: SampleDatabase, now: Date): Promise<IDeliveryBoard> {
    const requests = await db.select().from(sampleRequests).where(inArray(sampleRequests.status, ["paid", "shipped", "delivered"]));
    const shipments = await SampleAdminDataService.latestShipments(db, requests.map((request) => request.id));

    return buildDeliveryBoard(requests.map((request) => ({ request, shipment: shipments.get(request.id) ?? null })), now);
  }
}
