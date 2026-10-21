import type { ISampleRequestInput } from "@/app/utils/sample-request-input";
import { EMPTY_SAMPLE_REQUEST_INPUT } from "@/app/utils/sample-request-input";
import type { IBiteshipArea, ICourierOption } from "@/services/biteship.service";

/** Dev-only data sets for stress-testing `/sample`. Chosen with `?data=` and never active in production. */
export type SampleDevData = "demo" | "worst" | "empty" | "one";

export const SAMPLE_DEV_DATA: SampleDevData[] = ["demo", "worst", "empty", "one"];

/** The `?data=` set in the URL, or null outside development and when unset. */
export function sampleDevData(): SampleDevData | null {
  if (process.env.NODE_ENV !== "development" || typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("data");
  return SAMPLE_DEV_DATA.find((set) => set === value && set !== "demo") ?? null;
}

const LONG_AREA: IBiteshipArea = {
  id: "IDNP6IDNC147IDND836IDZ12310",
  name: "Pondok Pinang (Pondok Indah), Kebayoran Lama, Kota Jakarta Selatan, DKI Jakarta. 12310",
  province: "DKI Jakarta",
  city: "Kota Jakarta Selatan",
  district: "Kebayoran Lama",
  postalCode: "12310",
};

const SHORT_AREA: IBiteshipArea = {
  id: "IDNP3IDNC22IDND203IDZ15310",
  name: "Serpong, Tangerang Selatan, Banten. 15310",
  province: "Banten",
  city: "Tangerang Selatan",
  district: "Serpong",
  postalCode: "15310",
};

/** Every limit the validator allows, filled with things real Jakarta samplers type. */
const WORST_VALUES: ISampleRequestInput = {
  ...EMPTY_SAMPLE_REQUEST_INPUT,
  fullName: "Raden Ajeng Kartika Dewi Sekarwangi Purbaningrum-Hadiningrat",
  email: "kartika.purbaningrum.hadiningrat+sampling-batch01@mahasiswa.universitas-indonesia.ac.id",
  instagramHandle: "kartika.purbaningrum_hadiningr",
  consent: "on",
  willShare: "on",
  mainSport: "other",
  mainSportOther: "Trail running dan ultramarathon pegunungan (Rinjani 100, Bromo Tengger Semeru 170K)",
  runClub:
    "Komunitas Lari Pagi Bintaro Jaya Sektor 9 dan Sekitarnya (BJRunners Weekend Long Run Squad), cabang Pondok Aren, Tangerang Selatan, dan grup WhatsApp Lari Santai Minggu Pagi CFD Sudirman-Thamrin",
  sessionsPerWeek: "five_plus",
  sessionLength: "over_90",
  trainWhere: "outdoors",
  hydrationGoal: "other",
  hydrationGoalOther: "Kram betis di kilometer 30 ke atas, apalagi kalau lari siang hari di jalur aspal tanpa pohon",
  addressLine:
    "Jl. Letjen. TB Simatupang Kav. 88, Gedung Menara Prima Graha Lantai 23 Unit 2305-2307, RT 004/RW 011, Kel. Tanjung Barat, Kec. Jagakarsa,\nbelakang Indomaret, pagar hitam, masuk gang sebelah Masjid Al-Ikhlas, rumah ketiga cat hijau",
  whatsapp: "+62 812-3456-7890",
  deliveryNote:
    "Titip ke satpam lobi selatan (Pak Slamet) kalau saya belum pulang, jangan ke lobi utara karena sering tutup. Tolong telepon dulu sebelum sampai, bel rumah rusak dan anjing galak di halaman depan.",
};

/** Starting form values for the chosen set, or null to start empty. */
export function sampleDevValues(): ISampleRequestInput | null {
  const set = sampleDevData();
  if (set === "worst") return WORST_VALUES;
  if (set === "one") return { ...EMPTY_SAMPLE_REQUEST_INPUT, fullName: "Jo", email: "a@b.co", instagramHandle: "jo", mainSport: "gym" };
  return null;
}

/** Area search results for the chosen set, or null to call the real API. */
export function sampleDevAreas(): IBiteshipArea[] | null {
  const set = sampleDevData();
  if (set === "worst") return [LONG_AREA, { ...LONG_AREA, id: `${LONG_AREA.id}-2`, name: "Pondok Pinang (Pondok Indah), Kebayoran Lama, Kota Jakarta Selatan, DKI Jakarta. 12311" }, ...Array.from({ length: 12 }, (_, index) => ({ ...SHORT_AREA, id: `${SHORT_AREA.id}-${index}`, name: `${SHORT_AREA.name.replace("15310", String(15310 + index))}` }))];
  if (set === "empty") return [];
  if (set === "one") return [SHORT_AREA];
  return null;
}

/** Courier quotes for the chosen set, or null to call the real API. */
export function sampleDevRates(): ICourierOption[] | null {
  const set = sampleDevData();
  if (set === "worst") {
    return [
      { courierCompany: "lion", courierType: "regpack", courierName: "Lion Parcel", serviceName: "REGPACK Regular Package Service", price: 1_000_000, etaLabel: "3 to 7 days" },
      { courierCompany: "sap", courierType: "reg", courierName: "SAP Express", serviceName: "Regular Service Door to Door", price: 125_500, etaLabel: "2 to 4 days" },
      { courierCompany: "paxel", courierType: "sameday", courierName: "Paxel", serviceName: "Same Day", price: 9_000, etaLabel: "Today" },
      { courierCompany: "jne", courierType: "reg", courierName: "JNE", serviceName: "Reguler", price: 10_000, etaLabel: "1 to 2 days" },
    ];
  }
  if (set === "empty") return [];
  if (set === "one") return [{ courierCompany: "jne", courierType: "reg", courierName: "JNE", serviceName: "Reguler", price: 1, etaLabel: "1 day" }];
  return null;
}
