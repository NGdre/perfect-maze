import { mean } from "@utils";

import { MAX_COLUMNS, MAX_ROWS, MIN_COLUMNS, MIN_ROWS } from "../constants";
import {
  validateIntGreaterThanOrEqual,
  validateIntLessThanOrEqual,
} from "../validation/utils";

const FRACTION_DIGITS = 2;

// может не должно быть возможности изменять координаты после создания точки?
export class Point2d {
  x: number;
  y: number;
  private fractionDigits?: number = FRACTION_DIGITS || 0;

  constructor(x: number, y: number) {
    const { fractionDigits } = this;
    this.x = +x.toFixed(fractionDigits);
    this.y = +y.toFixed(fractionDigits);
  }

  static isSamePoint(
    first: Point2d,
    second: Point2d,
    epsilon: number = 0.05,
  ): boolean {
    return (
      Math.abs(first.x - second.x) < epsilon &&
      Math.abs(first.y - second.y) < epsilon
    );
  }
}

export class Wall {
  private _start: Point2d;
  private _end: Point2d;
  private _visible: boolean = true;

  constructor(start: Point2d, end: Point2d) {
    this._start = start;
    this._end = end;
  }

  static isSameWall(first: Wall, second: Wall) {
    return (
      Point2d.isSamePoint(first.start, second.end) &&
      Point2d.isSamePoint(first.end, second.start)
    );
  }

  set visible(value: boolean) {
    this._visible = value;
  }

  get visible() {
    return this._visible;
  }

  get start() {
    return this._start;
  }

  get end() {
    return this._end;
  }
}

// clockwise relative to canvas coordinates
export function getCirclePoint(
  r: number,
  theta: number,
  isDegrees = true,
  clockwise = false,
) {
  if (clockwise) theta = -theta;
  if (isDegrees) {
    theta = (theta * Math.PI) / 180;
  }
  const x = r * Math.cos(theta);
  const y = r * Math.sin(theta);

  return { x, y };
}

export abstract class PolygonCell {
  protected _id: string;
  protected _walls: Array<Wall> = [];
  protected _edgeLength: number = 1;
  abstract numberOfWalls: number;
  abstract generateWalls(x: number, y: number): void;

  neighbors: Array<string> = [];

  constructor(id: string) {
    this._id = id;
  }

  get id() {
    return this._id;
  }

  get walls() {
    // without cloning now
    return this._walls;
  }

  get center() {
    const xValues = [];
    const yValues = [];

    for (let i = 0; i < this.numberOfWalls; i++) {
      xValues.push(this._walls[i].start.x);
      yValues.push(this._walls[i].start.y);
    }

    return new Point2d(mean(xValues), mean(yValues));
  }

  //not tested
  getPoints(scaleFactor = 1) {
    const points = [];

    for (let i = 0; i < this.numberOfWalls; i++) {
      const { x, y } = this.walls[i].start;

      points.push({ x: x * scaleFactor, y: y * scaleFactor });
    }

    return points;
  }

  protected nextVertice(vertice: Point2d, angle: number) {
    const { x, y } = getCirclePoint(this._edgeLength, angle, true);

    return new Point2d(x + vertice.x, y + vertice.y);
  }

  protected _generateWalls(start: Point2d, angle: number) {
    let prev = start;
    let next;
    let currAngle = 0;

    // the walls must be empty when regenerating
    this._walls.length = 0;

    // the first point already exists, so i = 1
    for (let i = 1; i < this.numberOfWalls; i++) {
      next = this.nextVertice(prev, currAngle);
      currAngle += angle;
      this._walls.push(new Wall(prev, next));
      prev = next;
    }

    this._walls.push(new Wall(next as Point2d, start));
  }
}

export class SquareCell extends PolygonCell {
  numberOfWalls = 4;

  constructor(id: string) {
    super(id);
  }

  generateWalls(x: number, y: number) {
    const start = new Point2d(x, y);
    this._generateWalls(start, 90);
  }
}

export class HexagonCell extends PolygonCell {
  numberOfWalls = 6;

  constructor(id: string) {
    super(id);
  }

  generateWalls(x: number, y: number, clockwise: boolean = true) {
    const rotationAngle = 60;
    const start = new Point2d(x, y);
    this._generateWalls(start, clockwise ? rotationAngle : -rotationAngle);
  }
}

type RectMazeCells = Array<SquareCell>;

type MazeCells = PolygonCell[];

type cellId = string;

export function generateRectMazeId(i: number, j: number): cellId {
  return i + "," + j;
}

export type RectMaze = {
  cells: RectMazeCells;
  rows: number;
  cols: number;
};

export type idToCellMap = Map<cellId, PolygonCell>;

export const createIdToCellMap = (cells: MazeCells): idToCellMap => {
  const map: idToCellMap = new Map();
  const len = cells.length;

  for (let i = 0; i < len; i++) {
    map.set(cells[i].id, cells[i]);
  }

  return map;
};

function generatePositions(
  startPoint: [number, number],
  angle: number,
  wallsAmount: number,
) {
  const positions = new Array(wallsAmount);

  positions[0] = startPoint;
  let currAngle = 0;

  for (let i = 1; i < wallsAmount; i++) {
    const { x, y } = getCirclePoint(1, currAngle, true);

    const [prevX, prevY] = positions[i - 1];

    positions[i] = [Math.floor(prevX + x), Math.floor(prevY + y)];

    currAngle += angle;
  }

  return positions;
}

export interface MazeData {
  x: number[];
  y: number[];
  cellIds: string[];
  visible: number[];
  indexByCellId: Map<string, number>;
  wallsAmount: number;
}

export const getCellIndexFromWallIndex = (
  wallIndex: number,
  wallsAmount: number,
): number => {
  return Math.floor(wallIndex / wallsAmount);
};

export const getDefaultMazeData = (): MazeData => {
  return {
    x: [],
    y: [],
    cellIds: [],
    visible: [],
    indexByCellId: new Map(),
    wallsAmount: 4,
  };
};

export const createMaze = (
  rows: number,
  cols: number,
  wallsAmount = 4,
): MazeData => {
  validateIntGreaterThanOrEqual(rows, MIN_ROWS);
  validateIntGreaterThanOrEqual(cols, MIN_COLUMNS);
  validateIntLessThanOrEqual(rows, MAX_ROWS);
  validateIntLessThanOrEqual(cols, MAX_COLUMNS);

  const cellIds: string[] = [];
  const x: number[] = [];
  const y: number[] = [];
  const visible: number[] = [];
  const indexByCellId: Map<string, number> = new Map();

  const angle = 360 / wallsAmount;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const id = generateRectMazeId(i, j);
      indexByCellId.set(id, cellIds.length);

      cellIds.push(id);

      const positions = generatePositions([j, i], angle, wallsAmount);

      for (let k = 0; k < wallsAmount; k++) {
        x.push(positions[k][0]);
        y.push(positions[k][1]);
        visible.push(1);
      }
    }
  }

  return {
    x,
    y,
    cellIds,
    visible,
    indexByCellId,
    wallsAmount,
  };
};

export const getCellCoords = (
  nums: number[],
  index: number,
  wallsAmount: number,
) => {
  const points = [];

  let left = index * wallsAmount;
  const right = left + wallsAmount;

  for (; left < right; left++) points.push(nums[left]);

  return points;
};

export const getCellPoints = (
  { x, y, wallsAmount }: Pick<MazeData, "x" | "y" | "wallsAmount">,
  index: number,
  scaleFactor = 1,
) => {
  const cellXCords = getCellCoords(x, index, wallsAmount);
  const cellYCords = getCellCoords(y, index, wallsAmount);

  const points = [];

  for (let i = 0; i < wallsAmount; i++) {
    points.push({
      x: cellXCords[i] * scaleFactor,
      y: cellYCords[i] * scaleFactor,
    });
  }

  return points;
};

export const getCellWalls = (
  { x, y, wallsAmount }: Pick<MazeData, "x" | "y" | "wallsAmount">,
  index: number,
) => {
  const cellXCords = getCellCoords(x, index, wallsAmount);
  const cellYCords = getCellCoords(y, index, wallsAmount);

  const walls = [];

  for (let i = 0; i < wallsAmount - 1; i++)
    walls.push([
      cellXCords[i],
      cellYCords[i],
      cellXCords[i + 1],
      cellYCords[i + 1],
    ]);

  walls.push([
    cellXCords[wallsAmount - 1],
    cellYCords[wallsAmount - 1],
    cellXCords[0],
    cellYCords[0],
  ]);

  return walls;
};

export const getCellCenter = (
  { x, y, wallsAmount }: MazeData,
  index: number,
) => {
  const cellXCords = getCellCoords(x, index, wallsAmount);
  const cellYCords = getCellCoords(y, index, wallsAmount);

  return { x: mean(cellXCords), y: mean(cellYCords) };
};

export const createWallBetweenCellsSearcher =
  ({ indexByCellId, x, y, wallsAmount }: MazeData) =>
  (firstCellId: string, secondCellId: string) => {
    const firstCellIndex = indexByCellId.get(firstCellId);
    const secondCellIndex = indexByCellId.get(secondCellId);

    if (firstCellIndex === undefined || secondCellIndex === undefined)
      return -1;

    const wallsForFirstCell = getCellWalls(
      { x, y, wallsAmount },
      firstCellIndex,
    );
    const wallsForSecondCell = getCellWalls(
      { x, y, wallsAmount },
      secondCellIndex,
    );

    for (let i = 0; i < wallsAmount; i++) {
      const [x1, y1, x2, y2] = wallsForFirstCell[i];

      for (let j = 0; j < wallsAmount; j++) {
        const [a1, b1, a2, b2] = wallsForSecondCell[j];

        if (x1 === a2 && y1 === b2 && x2 === a1 && y2 === b1)
          return [
            firstCellIndex * wallsAmount + i,
            secondCellIndex * wallsAmount + j,
          ];
      }
    }

    return -1;
  };

// mutates visible
export const removeWalls = (
  mazeData: MazeData,
  wallsToRemove: [string, string][],
) => {
  const searchCommonWall = createWallBetweenCellsSearcher(mazeData);

  for (const [firstCellId, secondCellId] of wallsToRemove) {
    const searchResult = searchCommonWall(firstCellId, secondCellId);

    if (searchResult === -1) {
      return;
    }

    const [firstWallPos, secondWallPos] = searchResult;

    const visible = mazeData.visible;

    visible[firstWallPos] = 0;
    visible[secondWallPos] = 0;
  }
};

export type WallsToRemove = [string, string][];

export const removeWallsPure = (
  mazeData: MazeData,
  wallsToRemove: WallsToRemove,
): MazeData => {
  const clone = { ...mazeData, visible: mazeData.visible.slice(0) };

  removeWalls(clone, wallsToRemove);

  return clone;
};

export const getWallByPosition = (
  { x, y, wallsAmount }: Pick<MazeData, "x" | "y" | "wallsAmount">,
  wallPosition: number,
) => {
  const wallPosInCell = wallPosition % wallsAmount;

  const isLastWallPosInCell = wallPosInCell === wallsAmount - 1;

  const left = wallPosition - wallPosInCell;
  const right = left + wallsAmount - 1;

  if (isLastWallPosInCell) return [x[right], y[right], x[left], y[left]];

  return [
    x[wallPosition],
    y[wallPosition],
    x[wallPosition + 1],
    y[wallPosition + 1],
  ];
};

export const getVisibleWalls = ({ x, y, wallsAmount, visible }: MazeData) => {
  const visibleWalls = [];

  for (let i = 0; i < x.length; i++) {
    if (visible[i]) {
      visibleWalls.push(getWallByPosition({ x, y, wallsAmount }, i));
    }
  }

  return visibleWalls;
};

export const mapPairsToNeighbors = (
  { cellIds, indexByCellId }: MazeData,
  wallsToRemove: WallsToRemove,
): string[][] => {
  const neighbors = new Array(cellIds.length);

  for (const [firstCellId, secondCellId] of wallsToRemove) {
    const firstCellIndex = indexByCellId.get(firstCellId);
    const secondCellIndex = indexByCellId.get(secondCellId);

    if (firstCellIndex === undefined || secondCellIndex === undefined)
      throw new Error("bad data");

    if (neighbors[firstCellIndex] === undefined) neighbors[firstCellIndex] = [];

    neighbors[firstCellIndex].push(secondCellId);

    if (neighbors[secondCellIndex] === undefined)
      neighbors[secondCellIndex] = [];

    neighbors[secondCellIndex].push(firstCellId);
  }

  return neighbors;
};

export const createCellFinder = (mazeData: MazeData, neighbors: string[][]) => {
  return (id: string) => {
    const cellIndex = mazeData.indexByCellId.get(id);

    if (cellIndex === undefined) return null;

    return {
      id,
      center: getCellCenter(mazeData, cellIndex),
      neighbors: neighbors[cellIndex],
      numberOfWalls: mazeData.wallsAmount,
      getPoints: (scaleFactor: number) =>
        getCellPoints(mazeData, cellIndex, scaleFactor),
    };
  };
};
