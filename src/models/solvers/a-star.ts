import { aStarVisualSchema } from "@configs/visual";
import { mapGenerator } from "@utils";

import { type createIdToCellMap } from "../maze";
import { type heuristic, manhattanDistance } from "./heuristics";
import { reconstructPathSerial } from "./reconstruct-path";

type id = string;

export type AStarText = {
  "h-value": string;
  "g-value": string;
  "f-value": string;
};

export type AStarSolutionStep =
  | {
      isPathCell: false;
      enqueued: Array<{
        id: id;
        text: AStarText;
      }>;
      visited: {
        id: id;
        text: AStarText;
      };
    }
  | {
      isPathCell: true;
      foundPath: id;
      prevCellId: id | null;
    };

type AStarCell = {
  id: id;
  color: string;
  lineColor?: string;
  isPathCell: boolean;
  prevCellId?: id;
  text?: AStarText;
  heatmapValue?: number;
};

export function applyAStarVisual(solutionStep: AStarSolutionStep) {
  if (solutionStep.isPathCell) {
    return [
      {
        id: solutionStep.foundPath,
        color: aStarVisualSchema.foundPath.colors.background,
        lineColor: aStarVisualSchema.foundPath.colors.line,
        prevCellId: solutionStep.prevCellId,
        isPathCell: true,
      },
    ];
  }

  const changedCells: AStarCell[] = [];

  if (!solutionStep.visited || !solutionStep.enqueued)
    throw new Error("solutionStep has no visited or enqueued cell");

  for (const { id, text } of solutionStep.enqueued) {
    changedCells.push({
      id,
      text,
      color: aStarVisualSchema.enqueued.colors.background,
      heatmapValue: +text["h-value"],
      isPathCell: false,
    });
  }

  changedCells.push({
    id: solutionStep.visited.id,
    text: solutionStep.visited.text,
    color: aStarVisualSchema.visited.colors.background,
    heatmapValue: +solutionStep.visited.text["h-value"],
    isPathCell: false,
  });

  return changedCells;
}

export class AStarNode {
  id: string;
  x: number;
  y: number;
  g: number;
  h: number;

  constructor(id: string, x: number, y: number, g: number = 0, h: number = 0) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.g = g;
    this.h = h;
  }

  get f(): number {
    return this.g + this.h;
  }

  static createKey(x: number, y: number) {
    return `${x},${y}`;
  }

  getText(): AStarText {
    return {
      "f-value": "" + Math.round(this.f),
      "g-value": "" + Math.round(this.g),
      "h-value": "" + Math.round(this.h),
    };
  }
}

/*
  - нужно определится с возврщаемыми значениями
  - функция знает слишком много об интерфейсе узлов. Если он поменяется, то функция сломается
  - нужно сделать более прозрачную логику
*/
export function* aStarSerial(
  startId: string,
  endId: string,
  idToCellMap: ReturnType<typeof createIdToCellMap>,
  heuristic: heuristic = manhattanDistance,
) {
  const open: AStarNode[] = [];
  const closed = new Set<string>();
  const cameFrom = new Map<string, string>();

  const startCell = idToCellMap.get(startId);
  const endCell = idToCellMap.get(endId);

  if (!startCell || !endCell) return null;

  const startX = startCell.center.x;
  const startY = startCell.center.y;

  const endX = endCell.center.x;
  const endY = endCell.center.y;

  const startNode = new AStarNode(
    startId,
    startX,
    startY,
    0,
    heuristic({ x: startX, y: startY }, { x: endX, y: endY }),
  );

  open.push(startNode);

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f || a.h - b.h);

    const currentAStarNode = open.shift()!;

    if (currentAStarNode.x === endX && currentAStarNode.y === endY) {
      break;
    }

    const currMazeCell = idToCellMap.get(currentAStarNode.id);

    if (!currMazeCell) return null;

    closed.add(AStarNode.createKey(currentAStarNode.x, currentAStarNode.y)); // почему такой порядок?

    const partialSolution: AStarSolutionStep = {
      isPathCell: false,
      enqueued: [],
      visited: {
        id: currentAStarNode.id,
        text: currentAStarNode.getText(),
      },
    };

    for (const neighborId of currMazeCell.neighbors) {
      const neighborMazeCell = idToCellMap.get(neighborId);

      if (!neighborMazeCell) return null;

      const neighborX = neighborMazeCell.center.x;
      const neighborY = neighborMazeCell.center.y;

      const neighborKey = AStarNode.createKey(neighborX, neighborY);

      if (closed.has(neighborKey)) continue;

      const neighborData: { id: string; text: AStarText } = {
        id: neighborId,
        text: { "h-value": "", "g-value": "", "f-value": "" },
      };

      const tentativeG = currentAStarNode.g + 1; // почему +1?

      const neighbor = open.find((n) => n.x === neighborX && n.y === neighborY);

      if (neighbor) {
        if (tentativeG < neighbor.g) {
          neighbor.g = tentativeG;

          neighborData.text = neighbor.getText();

          cameFrom.set(neighborId, currentAStarNode.id);
        }
      } else {
        const h = heuristic(
          { x: neighborX, y: neighborY },
          { x: endX, y: endY },
        );

        const newNeighborNode = new AStarNode(
          neighborId,
          neighborX,
          neighborY,
          tentativeG,
          h,
        );

        neighborData.text = newNeighborNode.getText();

        open.push(newNeighborNode);

        if (!cameFrom.has(neighborId))
          cameFrom.set(neighborId, currentAStarNode.id);
      }

      partialSolution.enqueued.push(neighborData);
    }

    yield partialSolution;
  }

  let prevCellId = null;

  for (const cellId of reconstructPathSerial(startId, endId, cameFrom)) {
    const partialSolution: AStarSolutionStep = {
      isPathCell: true,
      foundPath: cellId,
      prevCellId,
    };

    if (prevCellId) yield partialSolution;

    prevCellId = cellId;
  }
}

export function aStarSerialVisual(
  startId: string,
  endId: string,
  idToCellMap: ReturnType<typeof createIdToCellMap>,
) {
  return mapGenerator(
    aStarSerial(startId, endId, idToCellMap),
    applyAStarVisual,
  );
}

export default aStarSerial;
