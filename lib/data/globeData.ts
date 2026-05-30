// ─── Types ────────────────────────────────────────────────────────────────────

export interface Hub {
  id:   string;
  name: string;
  lat:  number;
  lon:  number;
}

export interface SpeakerData {
  name:       string;
  university: string;
  imageUrl?:  string;
}

export type PathCategory =
  | "Азия"
  | "Северная Америка"
  | "Европа"
  | "Ближний Восток";

export interface SpeakerPath {
  id:           string;
  category:     PathCategory;
  sourceHubId:  string;   // always "bishkek"
  targetHubId:  string;
  speakerData:  SpeakerData;
}

// ─── Hubs ─────────────────────────────────────────────────────────────────────

export const HUBS: Hub[] = [
  { id: "bishkek",    name: "Бишкек",       lat:  42.87, lon:  74.59 },
  { id: "tokyo",      name: "Токио",         lat:  35.68, lon: 139.69 },
  { id: "beijing",    name: "Пекин",         lat:  39.91, lon: 116.39 },
  { id: "singapore",  name: "Сингапур",      lat:   1.35, lon: 103.82 },
  { id: "seoul",      name: "Сеул",          lat:  37.57, lon: 126.98 },
  { id: "newyork",    name: "Нью-Йорк",      lat:  40.71, lon: -74.00 },
  { id: "toronto",    name: "Торонто",       lat:  43.65, lon: -79.38 },
  { id: "london",     name: "Лондон",        lat:  51.51, lon:  -0.13 },
  { id: "berlin",     name: "Берлин",        lat:  52.52, lon:  13.40 },
  { id: "dubai",      name: "Дубай",         lat:  25.20, lon:  55.27 },
];

// ─── Speaker paths (all originate from Bishkek) ────────────────────────────────

export const SPEAKER_PATHS: SpeakerPath[] = [
  {
    id:          "sp-tokyo",
    category:    "Азия",
    sourceHubId: "bishkek",
    targetHubId: "tokyo",
    speakerData: { name: "Айдана Раимова",      university: "Waseda University"      },
  },
  {
    id:          "sp-beijing",
    category:    "Азия",
    sourceHubId: "bishkek",
    targetHubId: "beijing",
    speakerData: { name: "Мирлан Алиев",         university: "Tsinghua University"    },
  },
  {
    id:          "sp-singapore",
    category:    "Азия",
    sourceHubId: "bishkek",
    targetHubId: "singapore",
    speakerData: { name: "Айзат Кенжебаева",     university: "NUS"                   },
  },
  {
    id:          "sp-seoul",
    category:    "Азия",
    sourceHubId: "bishkek",
    targetHubId: "seoul",
    speakerData: { name: "Бегайым Осмонова",     university: "Seoul National Univ."  },
  },
  {
    id:          "sp-newyork",
    category:    "Северная Америка",
    sourceHubId: "bishkek",
    targetHubId: "newyork",
    speakerData: { name: "Нурлан Исаков",        university: "NYU Stern"             },
  },
  {
    id:          "sp-toronto",
    category:    "Северная Америка",
    sourceHubId: "bishkek",
    targetHubId: "toronto",
    speakerData: { name: "Чолпон Эркинова",      university: "University of Toronto" },
  },
  {
    id:          "sp-london",
    category:    "Европа",
    sourceHubId: "bishkek",
    targetHubId: "london",
    speakerData: { name: "Зарина Бекова",        university: "UCL"                   },
  },
  {
    id:          "sp-berlin",
    category:    "Европа",
    sourceHubId: "bishkek",
    targetHubId: "berlin",
    speakerData: { name: "Тилек Сатыбалдиев",   university: "TU Berlin"             },
  },
  {
    id:          "sp-dubai",
    category:    "Ближний Восток",
    sourceHubId: "bishkek",
    targetHubId: "dubai",
    speakerData: { name: "Темир Абдыкеров",      university: "American Univ. in Dubai" },
  },
];

// ─── Category → hub ids helper ────────────────────────────────────────────────

export const CATEGORIES: PathCategory[] = [
  "Азия", "Северная Америка", "Европа", "Ближний Восток",
];

export function getPathsByCategory(cat: PathCategory): SpeakerPath[] {
  return SPEAKER_PATHS.filter((p) => p.category === cat);
}
