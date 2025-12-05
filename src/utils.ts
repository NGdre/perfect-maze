import { Point2d } from "@models/maze";

export { default as clamp } from "lodash/clamp";
export { default as random } from "lodash/random";
export { default as mean } from "lodash/mean";
export { default as throttle } from "lodash/throttle";
export { default as noop } from "lodash/noop";
export { default as pick } from "lodash/pick";

export { default as flow } from "lodash/fp/flow";

export function loopPairs<T>(pairs: Array<T>, cb: (prev: T, curr: T) => void) {
  let prev = pairs[0];
  const len = pairs.length;

  for (let i = 1; i < len; i++) {
    const curr = pairs[i];

    cb(prev, curr);

    prev = curr;
  }
}

export function mapGenerator<T, U, R>(
  generator: Generator<T, R>,
  transform: (value: T) => U,
): Generator<U, R> {
  return {
    next(arg?: unknown): IteratorResult<U, R> {
      const result = generator.next(arg);
      return result.done
        ? { value: result.value, done: true }
        : { value: transform(result.value), done: false };
    },

    return(value?: unknown): IteratorResult<U, R> {
      if (generator.return) {
        const result = generator.return(value as R);
        return result.done
          ? { value: result.value, done: true }
          : { value: transform(result.value), done: false };
      } else {
        return { value: value as R, done: true };
      }
    },

    throw(error?: unknown): IteratorResult<U, R> {
      if (!generator.throw) throw error;
      const result = generator.throw(error);
      return result.done
        ? { value: result.value, done: true }
        : { value: transform(result.value), done: false };
    },

    [Symbol.iterator]() {
      return this;
    },
  };
}

export function getCentroid(points: Point2d[]) {
  let sumX = 0,
    sumY = 0;
  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
  }
  return {
    x: sumX / points.length,
    y: sumY / points.length,
  };
}

export function scalePolygonFromCenter(points: Point2d[], scaleFactor: number) {
  const centroid = getCentroid(points);
  return points.map((point) => {
    return {
      x: centroid.x + (point.x - centroid.x) * scaleFactor,
      y: centroid.y + (point.y - centroid.y) * scaleFactor,
    };
  });
}

export const parseSizeValue = (
  value: number | string,
  baseSize?: number,
): number => {
  if (typeof value === "number") {
    return Math.max(0, value);
  }

  // (?:\.\d+)? - optional decimal part
  const percentageMatch = value.trim().match(/^(\d+(?:\.\d+)?)\s*%$/);
  if (percentageMatch && baseSize) {
    const percentage = parseFloat(percentageMatch[1]);

    if (percentage >= 0 && percentage <= 100) {
      return baseSize * (percentage / 100);
    }
    console.warn(
      `Percentage value should be between 0 and 100, got: ${percentage}`,
    );
  }

  const numericValue = Number(value);
  return isNaN(numericValue) ? 0 : numericValue;
};

// Mulberry32
export function seededRandom(seed: number) {
  return function () {
    seed |= 0; // Ensure seed is a 32-bit integer
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sampleWithRandom<T>(
  array: readonly T[] | T[] | null | undefined,
  random: () => number,
): T | undefined {
  if (!array || !Array.isArray(array) || array.length === 0) {
    return undefined;
  }

  const index = Math.floor(random() * array.length);
  return array[index];
}
