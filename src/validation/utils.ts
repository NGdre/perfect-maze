import ow from "ow";

export function validateIntGreaterThanOrEqual(
  value: number,
  threshold: number,
) {
  ow(value, ow.number.integer.greaterThanOrEqual(threshold));
}

export function validateIntLessThanOrEqual(value: number, threshold: number) {
  ow(value, ow.number.integer.lessThanOrEqual(threshold));
}
