import { describe, expect, test, vi } from "vitest";

import {
  BiteshipService,
  type IBiteshipOrderInput,
  type IBiteshipPricing,
  phaseForBiteshipStatus,
  SAMPLE_PARCEL,
  ShipmentPhase,
} from "./biteship.service";

function pricing(patch: Partial<IBiteshipPricing>): IBiteshipPricing {
  return {
    courier_code: "jne",
    courier_service_code: "reg",
    courier_name: "JNE",
    courier_service_name: "Reguler",
    price: 10000,
    shipment_duration_range: "2 - 3",
    shipment_duration_unit: "days",
    ...patch,
  };
}

describe("BiteshipService.pickCourierOptions", () => {
  test("drops zero and missing prices, sorts by price, keeps four", () => {
    const options = BiteshipService.pickCourierOptions([
      pricing({ courier_code: "a", price: 15000 }),
      pricing({ courier_code: "b", price: 0 }),
      pricing({ courier_code: "c", price: 9000 }),
      pricing({ courier_code: "d", price: undefined }),
      pricing({ courier_code: "e", price: 12000 }),
      pricing({ courier_code: "f", price: 11000 }),
      pricing({ courier_code: "g", price: 10000 }),
    ]);

    expect(options.map((option) => option.courierCompany)).toEqual(["c", "g", "f", "e"]);
    expect(options[0]).toMatchObject({
      courierCompany: "c",
      courierType: "reg",
      courierName: "JNE",
      serviceName: "Reguler",
      price: 9000,
      etaLabel: "2 to 3 days",
    });
  });
});

describe("BiteshipService.formatEta", () => {
  test("turns a range and unit into a sentence", () => {
    expect(BiteshipService.formatEta("2 - 3", "days")).toBe("2 to 3 days");
  });

  test("singularises one day", () => {
    expect(BiteshipService.formatEta("1", "days")).toBe("1 day");
  });

  test("falls back when nothing is known", () => {
    expect(BiteshipService.formatEta(undefined, undefined)).toBe("A few days");
  });
});

describe("BiteshipService.mapAreas", () => {
  test("reads the documented response shape", () => {
    const areas = BiteshipService.mapAreas({
      success: true,
      areas: [
        {
          id: "IDNP6IDNC148IDND843IDZ12250",
          name: "Pesanggrahan, Jakarta Selatan, DKI Jakarta. 12250",
          country_name: "Indonesia",
          country_code: "ID",
          administrative_division_level_1_name: "DKI Jakarta",
          administrative_division_level_1_type: "province",
          administrative_division_level_2_name: "Jakarta Selatan",
          administrative_division_level_2_type: "city",
          administrative_division_level_3_name: "Pesanggrahan",
          administrative_division_level_3_type: "district",
          postal_code: 12250,
        },
      ],
    });

    expect(areas).toEqual([
      {
        id: "IDNP6IDNC148IDND843IDZ12250",
        name: "Pesanggrahan, Jakarta Selatan, DKI Jakarta. 12250",
        province: "DKI Jakarta",
        city: "Jakarta Selatan",
        district: "Pesanggrahan",
        postalCode: "12250",
      },
    ]);
  });

  test("returns nothing for a malformed body", () => {
    expect(BiteshipService.mapAreas({ success: false })).toEqual([]);
  });
});

describe("BiteshipService.buildOrderPayload", () => {
  const input: IBiteshipOrderInput = {
    referenceId: "B01-042-1",
    courierCompany: "jne",
    courierType: "reg",
    deliveryType: "now",
    deliveryDate: null,
    deliveryTime: null,
    destination: {
      name: "Fanny Lie",
      phone: "+6281234567890",
      email: "fanny@example.com",
      address: "Jl. Sudirman 12",
      note: "Leave with security",
      areaId: "IDNP6IDNC148IDND843IDZ12250",
      postalCode: "12250",
    },
    origin: {
      contactName: "WITHIN",
      contactPhone: "+628111111111",
      address: "BSD office",
      areaId: "IDNP6IDNC151IDND1000IDZ15345",
      postalCode: "15345",
      note: null,
    },
  };

  test("maps the request onto Biteship's fields for an immediate pickup", () => {
    const payload = BiteshipService.buildOrderPayload(input);

    expect(payload).toMatchObject({
      reference_id: "B01-042-1",
      courier_company: "jne",
      courier_type: "reg",
      delivery_type: "now",
      origin_area_id: "IDNP6IDNC151IDND1000IDZ15345",
      origin_postal_code: 15345,
      destination_area_id: "IDNP6IDNC148IDND843IDZ12250",
      destination_postal_code: 12250,
      destination_contact_name: "Fanny Lie",
      destination_note: "Leave with security",
      items: [{ ...SAMPLE_PARCEL }],
    });
    expect(payload).not.toHaveProperty("delivery_date");
  });

  test("adds the date and time for a scheduled pickup", () => {
    const payload = BiteshipService.buildOrderPayload({
      ...input,
      deliveryType: "scheduled",
      deliveryDate: "2026-10-27",
      deliveryTime: "10:00",
    });

    expect(payload).toMatchObject({ delivery_type: "scheduled", delivery_date: "2026-10-27", delivery_time: "10:00" });
  });
});

describe("BiteshipService.mapOrder", () => {
  test("reads the order id, courier fields and history", () => {
    const order = BiteshipService.mapOrder({
      success: true,
      id: "5dd6da88f43bd430ecd5aa2e",
      status: "allocated",
      price: 10000,
      courier: {
        tracking_id: "trk",
        waybill_id: "JNE123",
        link: "https://track",
        history: [{ status: "confirmed", note: "Order confirmed", updated_at: "2026-10-27T10:00:00+07:00" }],
      },
    });

    expect(order).toEqual({
      id: "5dd6da88f43bd430ecd5aa2e",
      status: "allocated",
      trackingId: "trk",
      waybillId: "JNE123",
      trackingLink: "https://track",
      price: 10000,
      history: [{ status: "confirmed", note: "Order confirmed", updatedAt: "2026-10-27T10:00:00+07:00" }],
    });
  });

  test("tolerates a missing courier block", () => {
    expect(BiteshipService.mapOrder({ id: "x", status: "confirmed" })).toMatchObject({
      waybillId: null,
      trackingLink: null,
      history: [],
    });
  });

  test("returns null without an id", () => {
    expect(BiteshipService.mapOrder({ status: "confirmed" })).toBeNull();
  });
});

describe("phaseForBiteshipStatus", () => {
  test.each([
    ["confirmed", ShipmentPhase.Booked],
    ["scheduled", ShipmentPhase.Booked],
    ["allocated", ShipmentPhase.Booked],
    ["picking_up", ShipmentPhase.Booked],
    ["picked", ShipmentPhase.Shipped],
    ["in_transit", ShipmentPhase.Shipped],
    ["dropping_off", ShipmentPhase.Shipped],
    ["delivered", ShipmentPhase.Delivered],
    ["on_hold", ShipmentPhase.Attention],
    ["return_in_transit", ShipmentPhase.Attention],
    ["returned", ShipmentPhase.Attention],
    ["rejected", ShipmentPhase.Attention],
    ["courier_not_found", ShipmentPhase.Attention],
    ["cancelled", ShipmentPhase.Attention],
    ["disposed", ShipmentPhase.Attention],
    ["something_new", ShipmentPhase.Attention],
  ])("%s is %s", (status, phase) => {
    expect(phaseForBiteshipStatus(status)).toBe(phase);
  });
});

describe("BiteshipService.createOrder failures", () => {
  test("returns null instead of throwing when the network call fails", async () => {
    process.env.BITESHIP_API_KEY = "biteship_test.x";
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));

    await expect(
      BiteshipService.createOrder({
        referenceId: "B01-001-1",
        courierCompany: "jne",
        courierType: "reg",
        deliveryType: "now",
        deliveryDate: null,
        deliveryTime: null,
        destination: { name: "A", phone: "+62812", email: "a@b.co", address: "x", note: null, areaId: "a", postalCode: "12250" },
        origin: { contactName: "W", contactPhone: "+62811", address: "y", areaId: "o", postalCode: "15345", note: null },
      })
    ).resolves.toBeNull();

    fetchSpy.mockRestore();
  });
});

describe("BiteshipService.fetchRates caching", () => {
  const PRICING_BODY = { success: true, pricing: [{ courier_code: "jne", courier_service_code: "reg", courier_name: "JNE", courier_service_name: "Reguler", price: 10000 }] };

  test("quotes an area once per ten minutes, and never caches an empty answer", async () => {
    process.env.BITESHIP_API_KEY = "biteship_test.x";
    process.env.SAMPLE_ORIGIN_CONTACT_NAME = "W";
    process.env.SAMPLE_ORIGIN_CONTACT_PHONE = "+62811";
    process.env.SAMPLE_ORIGIN_ADDRESS = "BSD";
    process.env.SAMPLE_ORIGIN_AREA_ID = "origin";
    process.env.SAMPLE_ORIGIN_POSTAL_CODE = "15345";
    BiteshipService.clearRatesCache();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify(PRICING_BODY)));

    await BiteshipService.fetchRates("area-a", 0);
    await BiteshipService.fetchRates("area-a", 9 * 60_000);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    await BiteshipService.fetchRates("area-a", 10 * 60_000);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    fetchSpy.mockImplementation(async () => new Response(JSON.stringify({ success: true, pricing: [] })));
    await BiteshipService.fetchRates("area-b", 0);
    await BiteshipService.fetchRates("area-b", 1);
    expect(fetchSpy).toHaveBeenCalledTimes(4);

    fetchSpy.mockRestore();
  });
});
