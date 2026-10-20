import "server-only";

import { requireEnv } from "@/lib/env";

/** One area from Biteship's search, flattened to what the form and the rate quote need. */
export interface IBiteshipArea {
  id: string;
  name: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
}

/** One courier service the sampler can pick, with the price they will pay. */
export interface ICourierOption {
  courierCompany: string;
  courierType: string;
  courierName: string;
  serviceName: string;
  price: number;
  etaLabel: string;
}

/** The raw `pricing[]` entry fields this system reads from the rates response. */
export interface IBiteshipPricing {
  courier_code?: string;
  courier_service_code?: string;
  courier_name?: string;
  courier_service_name?: string;
  price?: number;
  shipment_duration_range?: string;
  shipment_duration_unit?: string;
}

/** A Biteship order as this system keeps it, from create or retrieve. */
export interface IBiteshipOrder {
  id: string;
  status: string;
  trackingId: string | null;
  waybillId: string | null;
  trackingLink: string | null;
  price: number | null;
  history: Array<{ status: string; note: string; updatedAt: string }>;
}

/** The BSD office, as every order's origin. Read from env by `readSampleOrigin`. */
export interface ISampleOrigin {
  contactName: string;
  contactPhone: string;
  address: string;
  areaId: string;
  postalCode: string;
  note: string | null;
}

/** Everything needed to book one box with Biteship. */
export interface IBiteshipOrderInput {
  referenceId: string;
  courierCompany: string;
  courierType: string;
  deliveryType: "now" | "scheduled";
  deliveryDate: string | null;
  deliveryTime: string | null;
  destination: {
    name: string;
    phone: string;
    email: string;
    address: string;
    note: string | null;
    areaId: string;
    postalCode: string;
  };
  origin: ISampleOrigin;
}

/** Where a shipment stands for the sampler and the admin. */
export enum ShipmentPhase {
  Booked = "booked",
  Shipped = "shipped",
  Delivered = "delivered",
  Attention = "attention",
}

/** Couriers quoted to samplers. Comma-separated, as the rates API wants it. */
export const SAMPLE_COURIERS = "jne,sicepat,anteraja,jnt";

/** The box as declared to couriers: grams and centimetres, value in Rupiah. */
export const SAMPLE_PARCEL = {
  name: "WITHIN sample box",
  category: "food_and_drink",
  value: 15000,
  quantity: 1,
  weight: 150,
  length: 16,
  width: 5,
  height: 3,
} as const;

export const MAX_COURIER_OPTIONS = 4;

const BASE_URL = "https://api.biteship.com";

const DUPLICATE_REFERENCE_CODE = 40002060;

/** Biteship bills every quote, so one area is quoted at most once per window per instance. */
const RATES_CACHE_MS = 10 * 60_000;

const ratesCache = new Map<string, { at: number; options: ICourierOption[] }>();

const PHASE_BY_STATUS: Record<string, ShipmentPhase> = {
  confirmed: ShipmentPhase.Booked,
  scheduled: ShipmentPhase.Booked,
  allocated: ShipmentPhase.Booked,
  picking_up: ShipmentPhase.Booked,
  picked: ShipmentPhase.Shipped,
  in_transit: ShipmentPhase.Shipped,
  dropping_off: ShipmentPhase.Shipped,
  delivered: ShipmentPhase.Delivered,
};

/** Sampler-facing wording for each Biteship status. */
export const BITESHIP_STATUS_LABEL: Record<string, string> = {
  confirmed: "Courier booked",
  scheduled: "Pickup scheduled",
  allocated: "Courier assigned",
  picking_up: "Courier on the way to pick up",
  picked: "Picked up",
  in_transit: "In transit",
  dropping_off: "Out for delivery",
  delivered: "Delivered",
  on_hold: "On hold",
  return_in_transit: "Returning to sender",
  returned: "Returned to sender",
  rejected: "Rejected by courier",
  courier_not_found: "No courier available",
  cancelled: "Cancelled",
  disposed: "Disposed",
};

/** Booked, shipped, delivered, or something a founder needs to look at. */
export function phaseForBiteshipStatus(status: string): ShipmentPhase {
  return PHASE_BY_STATUS[status] ?? ShipmentPhase.Attention;
}

/** The BSD office from env. Throws when a key is missing, like every other secret read. */
export function readSampleOrigin(): ISampleOrigin {
  const note = process.env.SAMPLE_ORIGIN_NOTE ?? "";

  return {
    contactName: requireEnv("SAMPLE_ORIGIN_CONTACT_NAME"),
    contactPhone: requireEnv("SAMPLE_ORIGIN_CONTACT_PHONE"),
    address: requireEnv("SAMPLE_ORIGIN_ADDRESS"),
    areaId: requireEnv("SAMPLE_ORIGIN_AREA_ID"),
    postalCode: requireEnv("SAMPLE_ORIGIN_POSTAL_CODE"),
    note: note === "" ? null : note,
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

/** Biteship: area search, rate quotes, order booking and order reads. */
export class BiteshipService {
  /** Keeps priced options, cheapest first, at most four. */
  static pickCourierOptions(pricing: IBiteshipPricing[]): ICourierOption[] {
    return pricing
      .filter((entry): entry is IBiteshipPricing & { price: number } => typeof entry.price === "number" && entry.price > 0)
      .sort((a, b) => a.price - b.price)
      .slice(0, MAX_COURIER_OPTIONS)
      .map((entry) => ({
        courierCompany: entry.courier_code ?? "",
        courierType: entry.courier_service_code ?? "",
        courierName: entry.courier_name ?? "",
        serviceName: entry.courier_service_name ?? "",
        price: entry.price,
        etaLabel: BiteshipService.formatEta(entry.shipment_duration_range, entry.shipment_duration_unit),
      }));
  }

  /** "2 - 3" and "days" become "2 to 3 days"; a lone "1" becomes "1 day". */
  static formatEta(range: string | undefined, unit: string | undefined): string {
    const cleaned = (range ?? "").replace(/\s*-\s*/g, " to ").trim();
    if (cleaned === "") {
      return "A few days";
    }
    const unitWord = (unit ?? "days").trim() || "days";
    const singular = cleaned === "1" ? unitWord.replace(/s$/, "") : unitWord;

    return `${cleaned} ${singular}`;
  }

  /** Flattens the search response into areas; anything malformed yields none. */
  static mapAreas(raw: unknown): IBiteshipArea[] {
    const record = asRecord(raw);
    const areas = record?.areas;
    if (!Array.isArray(areas)) {
      return [];
    }

    const mapped: IBiteshipArea[] = [];
    for (const entry of areas) {
      const area = asRecord(entry);
      const id = stringOrNull(area?.id);
      const name = stringOrNull(area?.name);
      if (area === null || id === null || name === null) {
        continue;
      }
      mapped.push({
        id,
        name,
        province: stringOrNull(area.administrative_division_level_1_name) ?? "",
        city: stringOrNull(area.administrative_division_level_2_name) ?? "",
        district: stringOrNull(area.administrative_division_level_3_name) ?? "",
        postalCode: area.postal_code === undefined || area.postal_code === null ? "" : String(area.postal_code),
      });
    }

    return mapped;
  }

  /** The create-order body. Postal codes go as numbers, as Biteship's examples do. */
  static buildOrderPayload(input: IBiteshipOrderInput): Record<string, unknown> {
    const { origin, destination } = input;
    const scheduled =
      input.deliveryType === "scheduled" && input.deliveryDate !== null && input.deliveryTime !== null
        ? { delivery_date: input.deliveryDate, delivery_time: input.deliveryTime }
        : {};

    return {
      reference_id: input.referenceId,
      shipper_contact_name: origin.contactName,
      shipper_contact_phone: origin.contactPhone,
      shipper_organization: "WITHIN",
      origin_contact_name: origin.contactName,
      origin_contact_phone: origin.contactPhone,
      origin_address: origin.address,
      origin_area_id: origin.areaId,
      origin_postal_code: Number(origin.postalCode),
      ...(origin.note === null ? {} : { origin_note: origin.note }),
      destination_contact_name: destination.name,
      destination_contact_phone: destination.phone,
      destination_contact_email: destination.email,
      destination_address: destination.address,
      destination_area_id: destination.areaId,
      destination_postal_code: Number(destination.postalCode),
      ...(destination.note === null ? {} : { destination_note: destination.note }),
      courier_company: input.courierCompany,
      courier_type: input.courierType,
      delivery_type: input.deliveryType,
      ...scheduled,
      items: [{ ...SAMPLE_PARCEL }],
    };
  }

  /** Reads an order body from create or retrieve. Null when there is no id. */
  static mapOrder(raw: unknown): IBiteshipOrder | null {
    const record = asRecord(raw);
    const id = stringOrNull(record?.id);
    if (record === null || id === null) {
      return null;
    }
    const courier = asRecord(record.courier);
    const rawHistory = Array.isArray(courier?.history) ? courier.history : [];
    const history = rawHistory.flatMap((entry) => {
      const item = asRecord(entry);
      const status = stringOrNull(item?.status);
      return item === null || status === null
        ? []
        : [{ status, note: stringOrNull(item.note) ?? "", updatedAt: stringOrNull(item.updated_at) ?? "" }];
    });

    return {
      id,
      status: stringOrNull(record.status) ?? "",
      trackingId: stringOrNull(courier?.tracking_id),
      waybillId: stringOrNull(courier?.waybill_id),
      trackingLink: stringOrNull(courier?.link),
      price: typeof record.price === "number" ? record.price : null,
      history,
    };
  }

  private static headers(): Record<string, string> {
    return { authorization: requireEnv("BITESHIP_API_KEY"), "content-type": "application/json" };
  }

  /** Area autocomplete. Empty below three characters; empty, with a log line, on any failure. */
  static async searchAreas(query: string): Promise<IBiteshipArea[]> {
    const input = query.trim();
    if (input.length < 3) {
      return [];
    }
    const params = new URLSearchParams({ countries: "ID", input, type: "single" });
    const response = await fetch(`${BASE_URL}/v1/maps/areas?${params}`, {
      headers: BiteshipService.headers(),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("[biteship] area search failed", response.status, await response.text());
      return [];
    }

    return BiteshipService.mapAreas(await response.json());
  }

  /** Forgets every cached quote. For tests. */
  static clearRatesCache(): void {
    ratesCache.clear();
  }

  /** Live quotes from the BSD office to one area, filtered, sorted and cached for ten minutes. */
  static async fetchRates(destinationAreaId: string, now: number = Date.now()): Promise<ICourierOption[]> {
    for (const [areaId, entry] of ratesCache) {
      if (now - entry.at >= RATES_CACHE_MS) ratesCache.delete(areaId);
    }
    const cached = ratesCache.get(destinationAreaId);
    if (cached !== undefined) {
      return cached.options;
    }

    const options = await BiteshipService.requestRates(destinationAreaId);
    if (options.length > 0) {
      ratesCache.set(destinationAreaId, { at: now, options });
    }

    return options;
  }

  private static async requestRates(destinationAreaId: string): Promise<ICourierOption[]> {
    const origin = readSampleOrigin();
    const response = await fetch(`${BASE_URL}/v1/rates/couriers`, {
      method: "POST",
      headers: BiteshipService.headers(),
      body: JSON.stringify({
        origin_area_id: origin.areaId,
        destination_area_id: destinationAreaId,
        couriers: SAMPLE_COURIERS,
        items: [{ ...SAMPLE_PARCEL }],
      }),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("[biteship] rates failed", response.status, await response.text());
      return [];
    }
    const payload = asRecord(await response.json());
    const pricing = Array.isArray(payload?.pricing) ? (payload.pricing as IBiteshipPricing[]) : [];

    return BiteshipService.pickCourierOptions(pricing);
  }

  /** Books one order. A reused reference id is treated as the earlier order, re-read from Biteship. */
  static async createOrder(input: IBiteshipOrderInput): Promise<IBiteshipOrder | null> {
    try {
      return await BiteshipService.requestOrder(input);
    } catch (error) {
      console.error("[biteship] create order threw", error);
      return null;
    }
  }

  private static async requestOrder(input: IBiteshipOrderInput): Promise<IBiteshipOrder | null> {
    const response = await fetch(`${BASE_URL}/v1/orders`, {
      method: "POST",
      headers: BiteshipService.headers(),
      body: JSON.stringify(BiteshipService.buildOrderPayload(input)),
      cache: "no-store",
    });
    const payload = asRecord(await response.json().catch(() => null));

    if (!response.ok) {
      const details = asRecord(payload?.details);
      const existingId = stringOrNull(details?.order_id);
      if (payload?.code === DUPLICATE_REFERENCE_CODE && existingId !== null) {
        return BiteshipService.fetchOrder(existingId);
      }
      console.error("[biteship] create order failed", response.status, payload);
      return null;
    }

    return BiteshipService.mapOrder(payload);
  }

  /** The current state of an order, used after every webhook and for admin refreshes. */
  static async fetchOrder(orderId: string): Promise<IBiteshipOrder | null> {
    const response = await fetch(`${BASE_URL}/v1/orders/${encodeURIComponent(orderId)}`, {
      headers: BiteshipService.headers(),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("[biteship] order fetch failed", response.status, await response.text());
      return null;
    }

    return BiteshipService.mapOrder(await response.json());
  }
}
