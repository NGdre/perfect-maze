import { cloneDeep, flow, mean } from "@utils";

import { MAX_COLUMNS, MAX_ROWS, MIN_COLUMNS, MIN_ROWS } from "../constants";
import {
  validateEqualNumbers,
  validateIntGreaterThanOrEqual,
  validateIntLessThanOrEqual,
  validateNotNullObject,
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

type cellsIdPair = [firstCellId: string, secondCellId: string];

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

export const createRectMaze = (
  rows: RectMaze["rows"],
  cols: RectMaze["cols"],
): RectMaze => {
  validateIntGreaterThanOrEqual(rows, MIN_ROWS);
  validateIntGreaterThanOrEqual(cols, MIN_COLUMNS);
  validateIntLessThanOrEqual(rows, MAX_ROWS);
  validateIntLessThanOrEqual(cols, MAX_COLUMNS);

  const cells: RectMazeCells = [];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const id = generateRectMazeId(i, j);
      const cell = new SquareCell(id);

      cell.generateWalls(j, i);

      cells.push(cell);
    }
  }

  return {
    rows,
    cols,
    cells,
  };
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

export function findCell(map: idToCellMap) {
  return function (cellId: cellId) {
    const found = map.get(cellId);

    return found !== undefined ? found : null;
  };
}

export const createCellFinder = flow(createIdToCellMap, findCell);

// отдельно лучше не использовать, так как свойство neighbors будет некорректно
export function removeWallBetweenCells(
  firstCell: PolygonCell,
  secondCell: PolygonCell,
  fid: string,
  sid: string,
) {
  const firstWalls = firstCell.walls;
  const secondWalls = secondCell.walls;

  const numberOfWalls = firstWalls.length;

  validateEqualNumbers(numberOfWalls, secondWalls.length);

  let firstWall, secondWall;

  for (let i = 0; i < numberOfWalls; i++) {
    for (let j = 0; j < numberOfWalls; j++) {
      if (Wall.isSameWall(firstWalls[i], secondWalls[j])) {
        firstWall = firstWalls[i];
        secondWall = secondWalls[j];
        break;
      }
    }
  }

  if (!firstWall || !secondWall) {
    throw Error("can not find wall for removal");
  }

  firstWall.visible = false;
  secondWall.visible = false;

  if (!firstCell.neighbors.includes(sid)) {
    firstCell.neighbors.push(sid);
  }

  if (!secondCell.neighbors.includes(fid)) {
    secondCell.neighbors.push(fid);
  }
}

export function removeWallsBetweenCells(
  cells: MazeCells,
  pairs: Array<cellsIdPair>,
) {
  const pairsLength = pairs.length;

  const findCell = createCellFinder(cells);

  // reset neighbors
  for (let i = 0; i < cells.length; i++) {
    cells[i].neighbors.length = 0;
  }

  for (let i = 0; i < pairsLength; i++) {
    const fid = pairs[i][0];
    const sid = pairs[i][1];
    const fcell = findCell(fid);
    const scell = findCell(sid);

    validateNotNullObject(fcell, {
      label: `invalid pairs to remove: cell with id ${fid} is not found`,
    });

    validateNotNullObject(scell, {
      label: `invalid pairs to remove: cell with id ${sid} is not found`,
    });

    removeWallBetweenCells(fcell, scell, fid, sid);
  }
}
