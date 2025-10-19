import { Point2d } from "@models/maze";

// наверное Point2d нужно вынести из maze

export {
  sample,
  cloneDeep,
  clamp,
  random,
  mean,
  first,
  throttle,
  noop,
} from "lodash";
export { flow } from "lodash/fp";

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
