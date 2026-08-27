export const ERAS = [
  {
    id: "birth",
    label: "Birth",
    place: "Auckland",
    region: "New Zealand",
    at: 0,
  },
  {
    id: "childhood",
    label: "Childhood",
    place: "Shanghai",
    region: "China",
    at: 1,
  },
  {
    id: "sixthform",
    label: "High School",
    place: "Tonbridge",
    region: "Kent",
    at: 2,
  },
  {
    id: "college",
    label: "College",
    place: "UC Berkeley",
    region: "California",
    at: 3,
  },
  {
    id: "now",
    label: "Now",
    place: "San Francisco",
    region: "California",
    at: 4,
  },
] as const;

export type Era = (typeof ERAS)[number];
export type EraId = Era["id"];

export const HIGH_STREET_CHAPTER = {
  id: "high-street",
  label: "High Street",
  place: "Tonbridge",
  region: "Kent",
} as const;

export const BASKETBALL_CHAPTER = {
  id: "basketball",
  label: "Basketball",
  place: "Tonbridge",
  region: "Kent",
} as const;

export type NestedChapter = typeof HIGH_STREET_CHAPTER | typeof BASKETBALL_CHAPTER;

export const TIMELINE_START = ERAS[0].at;
export const TIMELINE_END = ERAS[ERAS.length - 1].at;
export const TIMELINE_EXTENT = TIMELINE_END - TIMELINE_START;
export const INITIAL_PROGRESS = ERAS.find((era) => era.id === "now")?.at ?? TIMELINE_END;

export function eraAt(id: EraId) {
  return ERAS.find((era) => era.id === id)?.at ?? 0;
}

export const HANDLE_SIZE = 28;

export function clampProgress(value: number) {
  return Math.min(TIMELINE_END, Math.max(TIMELINE_START, value));
}

export function eraVisibility(progress: number, at: number) {
  return clamp01(1 - Math.abs(progress - at));
}

export function eraDistance(progress: number, at: number) {
  return Math.abs(progress - at);
}

export function pointerToProgress(
  clientX: number,
  track: DOMRect,
  handleSize: number,
) {
  const usable = Math.max(1, track.width - handleSize);
  const unit = (clientX - track.left - handleSize / 2) / usable;
  return clampProgress(TIMELINE_START + unit * TIMELINE_EXTENT);
}

export function eraLocation(era: Pick<Era, "place" | "region">) {
  return `${era.place}, ${era.region}`;
}

export function progressToUnit(progress: number) {
  if (TIMELINE_EXTENT === 0) return 0;
  return (progress - TIMELINE_START) / TIMELINE_EXTENT;
}

export function progressValueText(progress: number) {
  const nearest = ERAS.reduce((best, era) =>
    eraDistance(progress, era.at) < eraDistance(progress, best.at) ? era : best,
  );

  if (eraDistance(progress, nearest.at) <= 0.12) {
    return `${nearest.label}, ${eraLocation(nearest)}`;
  }

  const later = ERAS.find((era) => era.at > progress);
  const earlier = [...ERAS].reverse().find((era) => era.at < progress);
  if (earlier && later) return `Between ${earlier.label} and ${later.label}`;
  return `${nearest.label}, ${eraLocation(nearest)}`;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}
