import { seededRandom } from "@utils";

// @ts-ignore
import UnionFind from "./union-find.js";

export const getAllNeighborsPairs = (m: number, n: number) => {
  const pairs = [];

  for (let i = 0; i < m - 1; i++) {
    for (let j = 0; j < n - 1; j++) {
      pairs.push(
        [`${i},${j}`, `${i},${j + 1}`],
        [`${i},${j}`, `${i + 1},${j}`],
      );
    }
  }

  for (let i = 0; i < m - 1; i++) {
    pairs.push([`${i},${n - 1}`, `${i + 1},${n - 1}`]);
  }

  for (let j = 0; j < n - 1; j++) {
    pairs.push([`${m - 1},${j}`, `${m - 1},${j + 1}`]);
  }

  return pairs;
};

export function* kruskal(m: number, n: number, seed?: number) {
  const uf = new UnionFind();

  const random = seed !== undefined ? seededRandom(seed) : Math.random;

  const cellsMatrix = new Array(m);

  for (let i = 0; i < m; i++) {
    cellsMatrix[i] = new Array(n);

    for (let j = 0; j < n; j++) {
      uf.add(`${i},${j}`);
    }
  }

  const neighborsPairs = getAllNeighborsPairs(m, n);

  while (neighborsPairs.length > 0) {
    const randomNeighborPairIndex = Math.floor(
      random() * neighborsPairs.length,
    );

    const [firstCellId, secondCellId] = neighborsPairs[randomNeighborPairIndex];

    if (!uf.connected(firstCellId, secondCellId)) {
      uf.union(firstCellId, secondCellId);

      yield neighborsPairs[randomNeighborPairIndex].map((id) => ({ id }));
    }

    neighborsPairs.splice(randomNeighborPairIndex, 1);
  }
}
