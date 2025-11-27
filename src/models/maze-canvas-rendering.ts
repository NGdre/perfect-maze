import { FILL_TO_CELL_RATIO, colors } from "@constants";
import { scalePolygonFromCenter } from "@utils";
import ow from "ow";

import { TextInBoxRenderer } from "./text-in-box-renderer";

export type LineCords = [number, number, number, number];

export interface Point2dCoords {
  x: number;
  y: number;
}

export interface ObjectWithGetPoints {
  getPoints(scaleFactor: number): Point2dCoords[];
}

export interface ObjectWithCenter {
  center: Point2dCoords;
}

export type ObjectWithGetPointsAndCenter = ObjectWithGetPoints &
  ObjectWithCenter;

const PI2 = Math.PI * 2;
const DEFAULT_FILL_FRACTION = 0.9;

export function drawLine(options: {
  ctx: CanvasRenderingContext2D;
  strokeStyle?: string;
  lineWidth?: number;
  batching?: boolean;
  scaleFactor?: number;
}) {
  const {
    strokeStyle,
    lineWidth,
    ctx,
    batching = false,
    scaleFactor = 1,
  } = options;

  if (lineWidth) ctx.lineWidth = lineWidth;
  if (strokeStyle) ctx.strokeStyle = strokeStyle;

  function line(...cords: LineCords) {
    const [x1, y1, x2, y2] = cords.map((c) => c * scaleFactor);

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  }

  if (batching) return line;
  else {
    return function (...cords: LineCords) {
      ctx.beginPath();

      line(...cords);

      ctx.stroke();
      ctx.closePath();
    };
  }
}

export function drawWalls(
  ctx: CanvasRenderingContext2D,
  visibleWalls: LineCords[],
  options: { wallColor?: string; lineWidth?: number; scaleFactor?: number },
) {
  const color = options.wallColor;
  const lineWidth = options.lineWidth;
  const scaleFactor = options.scaleFactor;

  const line = drawLine({
    ctx,
    strokeStyle: color,
    lineWidth,
    batching: true,
    scaleFactor,
  });

  ctx.beginPath();

  const len = visibleWalls.length;

  for (let i = 0; i < len; i++) {
    line(
      visibleWalls[i][0],
      visibleWalls[i][1],
      visibleWalls[i][2],
      visibleWalls[i][3],
    );
  }

  ctx.stroke();
}

export function fillWithCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
) {
  ctx.beginPath();

  ctx.fillStyle = color;

  ctx.arc(x, y, radius, 0, PI2);
  ctx.fill();
}

export function drawPolygon(
  ctx: CanvasRenderingContext2D,
  points: Point2dCoords[],
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();

  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.closePath();
  ctx.fill();
}

export function fillPolygonWithCircle(
  ctx: CanvasRenderingContext2D,
  cell: ObjectWithCenter,
  color: string,
  cellSize: number,
  fillFraction = DEFAULT_FILL_FRACTION,
) {
  ow(fillFraction, ow.number.positive.lessThanOrEqual(1));

  const { x, y } = cell.center;

  const halfCellLength = cellSize / 2;

  const radius = halfCellLength * fillFraction;

  fillWithCircle(ctx, x * cellSize, y * cellSize, radius, color);
}

export function drawCell(
  ctx: CanvasRenderingContext2D,
  cell: ObjectWithGetPoints,
  cellSize: number,
  options: {
    background?: string;
    scaleFromCenterFactor?: number;
  },
) {
  const { background = "black", scaleFromCenterFactor = FILL_TO_CELL_RATIO } =
    options;

  drawPolygon(
    ctx,
    scalePolygonFromCenter(cell.getPoints(cellSize), scaleFromCenterFactor),
    background,
  );
}

function drawTextInCell(
  ctx: CanvasRenderingContext2D,
  cell: ObjectWithGetPoints,
  cellSize: number,
  text: string,
) {
  const { x, y } = cell.getPoints(cellSize)[0];
  const textRenderer = new TextInBoxRenderer(ctx);

  textRenderer.addBox({
    x,
    y: y + 2,
    size: cellSize,
    texts: [
      {
        content: text,
        fontSize: Math.max(12, cellSize * 0.4),
        position: "center",
        fontFamily: "Roboto",
        color: "white",
        fontWeight: "700",
      },
    ],
  });

  textRenderer.render();
}

export function drawStart(
  ctx: CanvasRenderingContext2D,
  cell: ObjectWithGetPointsAndCenter,
  cellSize: number,
) {
  fillPolygonWithCircle(ctx, cell, colors.START_CELL, cellSize);

  drawTextInCell(ctx, cell, cellSize, "S");
}

export function drawFinish(
  ctx: CanvasRenderingContext2D,
  cell: ObjectWithGetPointsAndCenter,
  cellSize: number,
) {
  fillPolygonWithCircle(ctx, cell, colors.END_CELL, cellSize);

  drawTextInCell(ctx, cell, cellSize, "F");
}

export function drawHoveredCell(
  ctx: CanvasRenderingContext2D,
  cell: ObjectWithCenter,
  cellSize: number,
) {
  fillPolygonWithCircle(ctx, cell, colors.HOVERED_CELL, cellSize);
}

export const clearCellArea = (
  ctx: CanvasRenderingContext2D,
  cell: ObjectWithGetPoints,
  cellSize: number,
) => {
  const firstPoint = cell.getPoints(cellSize)[0];
  ctx.clearRect(firstPoint.x, firstPoint.y, cellSize, cellSize);
};
