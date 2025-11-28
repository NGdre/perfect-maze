import { bfsVisualSchema } from "@configs/visual";
import { mapGenerator } from "@utils";

import { createIdToCellMap } from "../maze";
import { reconstructPathSerial } from "./reconstruct-path";

type id = string;

export type BFSSolutionStep =
  | {
      isPathCell: false;
      enqueued: id[];
      visited: id;
    }
  | {
      isPathCell: true;
      foundPath: id;
      prevCellId: id | null;
    };

type bfsCell = {
  id: id;
  color: string;
  lineColor?: string;
  isPathCell: boolean;
  prevCellId?: id | null;
};

export function applyBfsVisual(solutionStep: BFSSolutionStep) {
  const changedCells: bfsCell[] = [];

  if (solutionStep.isPathCell) {
    changedCells.push({
      id: solutionStep.foundPath,
      color: bfsVisualSchema.foundPath.colors.background,
      lineColor: bfsVisualSchema.foundPath.colors.line,
      prevCellId: solutionStep.prevCellId,
      isPathCell: true,
    });
  } else {
    if (solutionStep.enqueued)
      for (const id of solutionStep.enqueued) {
        changedCells.push({
          id,
          color: bfsVisualSchema.enqueued.colors.background,
          isPathCell: false,
        });
      }

    if (solutionStep.visited)
      changedCells.push({
        id: solutionStep.visited,
        color: bfsVisualSchema.visited.colors.background,
        isPathCell: false,
      });
  }

  return changedCells;
}

export function* bfsSerial(
  startId: id,
  endId: id,
  idToCellMap: ReturnType<typeof createIdToCellMap>,
) {
  const queue = [startId];

  const visited = new Set();

  const cameFrom = new Map<string, string>();

  while (queue.length > 0) {
    const currId = queue.shift();

    if (currId === endId) {
      break;
    }

    // it needs so typescript could shut up
    if (!currId) continue;

    const currCell = idToCellMap.get(currId);

    if (!currCell) throw new Error("the cell is not found in bfs loop");
    if (currCell.neighbors.length === 0)
      throw new Error("any cell in perfect maze must have an open neighbor");

    visited.add(currId);

    const partialSolution: BFSSolutionStep = {
      isPathCell: false,
      enqueued: [],
      visited: currId,
    };

    for (const neighborId of currCell.neighbors) {
      if (!visited.has(neighborId)) {
        partialSolution.enqueued!.push(neighborId);

        queue.push(neighborId);

        cameFrom.set(neighborId, currId);
      }
    }

    yield partialSolution;
  }

  let prevCellId = null;

  for (const cellId of reconstructPathSerial(startId, endId, cameFrom)) {
    const partialSolution: BFSSolutionStep = {
      isPathCell: true,
      foundPath: cellId,
      prevCellId,
    };

    if (prevCellId) yield partialSolution;

    prevCellId = cellId;
  }
}

export function bfsSerialVisual(
  startId: string,
  endId: string,
  idToCellMap: ReturnType<typeof createIdToCellMap>,
) {
  return mapGenerator(bfsSerial(startId, endId, idToCellMap), applyBfsVisual);
}

export function bfsVisual(
  startId: string,
  endId: string,
  idToCellMap: ReturnType<typeof createIdToCellMap>,
) {
  const res = [];

  for (const solution of bfsSerial(startId, endId, idToCellMap)) {
    res.push(applyBfsVisual(solution));
  }

  return res;
}
