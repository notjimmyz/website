export function clamp(value: number, low: number, high: number) {
  return value < low ? low : value > high ? high : value;
}

export function clamp01(value: number) {
  return clamp(value, 0, 1);
}

export function mix(from: number, to: number, amount: number) {
  return from + (to - from) * clamp01(amount);
}

/** 0 at `low`, 1 at `high`, linear between. */
export function ramp(value: number, low: number, high: number) {
  if (high === low) return value >= high ? 1 : 0;
  return clamp01((value - low) / (high - low));
}

export function sign(value: number): 1 | -1 {
  return value >= 0 ? 1 : -1;
}
