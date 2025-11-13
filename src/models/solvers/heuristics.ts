export type heuristic = (
  firstPoint: { x: number; y: number },
  secondPoint: { x: number; y: number },
) => number;

export const manhattanDistance: heuristic = (firstPoint, secondPoint) => {
  return (
    Math.abs(firstPoint.x - secondPoint.x) +
    Math.abs(firstPoint.y - secondPoint.y)
  );
};

export const euclideanDistance: heuristic = (firstPoint, secondPoint) => {
  return Math.sqrt(
    Math.pow(firstPoint.x - secondPoint.x, 2) +
      Math.pow(firstPoint.y - secondPoint.y, 2),
  );
};

export const chebyshevDistance: heuristic = (firstPoint, secondPoint) => {
  return Math.max(
    Math.abs(firstPoint.x - secondPoint.x),
    Math.abs(firstPoint.y - secondPoint.y),
  );
};
