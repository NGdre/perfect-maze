import { FILL_TO_CELL_RATIO, colors } from "@constants";
import { loopPairs, scalePolygonFromCenter } from "@utils";
import ow from "ow";

import { Point2d, type PolygonCell } from "./maze";
import { TextInBoxRenderer } from "./text-in-box-renderer";

type context2d = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

type lineCords = [number, number, number, number];

export function drawLine(config: {
  ctx: context2d;
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
  } = config;

  if (lineWidth) ctx.lineWidth = lineWidth;
  if (strokeStyle) ctx.strokeStyle = strokeStyle;

  function line(...cords: lineCords) {
    const [x1, y1, x2, y2] = cords.map((c) => c * scaleFactor);

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  }

  if (batching) return line;
  else {
    return function (...cords: lineCords) {
      ctx.beginPath();

      line(...cords);

      ctx.stroke();
      ctx.closePath();
    };
  }
}

export function drawWalls(
  ctx: context2d,
  cells: PolygonCell[],
  opts: { wallColor?: string; lineWidth?: number; scaleFactor: number },
) {
  const color = opts.wallColor;
  const lineWidth = opts.lineWidth;
  const scaleFactor = opts.scaleFactor;

  const line = drawLine({
    ctx,
    strokeStyle: color,
    lineWidth,
    batching: true,
    scaleFactor,
  });

  ctx.beginPath();

  const len = cells.length;

  for (let i = 0; i < len; i++) {
    for (const wall of cells[i].walls) {
      if (!wall.visible) continue;

      line(wall.start.x, wall.start.y, wall.end.x, wall.end.y);
    }
  }

  ctx.stroke();
  ctx.closePath();
}

export function drawPath(
  ctx: context2d,
  path: PolygonCell[],
  opts: { pathColor?: string; lineWidth?: number },
) {
  const color = opts.pathColor;
  const lineWidth = opts.lineWidth;

  const connectDots = drawLine({ ctx, strokeStyle: color, lineWidth });

  loopPairs(path, (prev, curr) => {
    connectDots(prev.center.x, prev.center.y, curr.center.x, curr.center.y);
  });
}

const PI2 = Math.PI * 2;

export function fillWithCircle(
  ctx: context2d,
  x: number,
  y: number,
  radius: number,
  color: string,
) {
  ctx.beginPath();

  ctx.fillStyle = color;

  ctx.arc(x, y, radius, 0, PI2);
  ctx.fill();
  ctx.closePath(); //это нужно?
}

export function drawPolygon(ctx: context2d, points: Point2d[], color: string) {
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
  ctx: context2d,
  cell: PolygonCell,
  color: string,
  cellSize: number,
  fillFraction = 0.9,
) {
  ow(fillFraction, ow.number.positive.lessThanOrEqual(1));

  const { x, y } = cell.center;

  const halfCellLength = cellSize / 2;

  const radius = halfCellLength * fillFraction;

  fillWithCircle(ctx, x * cellSize, y * cellSize, radius, color);
}

export function drawCell(
  ctx: CanvasRenderingContext2D,
  cell: PolygonCell,
  cellSize: number,
  opt: {
    background: string;
    scaleFromCenterFactor?: number;
  },
) {
  const { background, scaleFromCenterFactor = FILL_TO_CELL_RATIO } = opt;

  drawPolygon(
    ctx,
    scalePolygonFromCenter(cell.getPoints(cellSize), scaleFromCenterFactor),
    background,
  );
}

function drawTextInCell(
  ctx: CanvasRenderingContext2D,
  cell: PolygonCell,
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
        fontSize: 20,
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
  cell: PolygonCell,
  cellSize: number,
) {
  fillPolygonWithCircle(ctx, cell, colors.START_CELL, cellSize);

  drawTextInCell(ctx, cell, cellSize, "S");
}

export function drawFinish(
  ctx: CanvasRenderingContext2D,
  cell: PolygonCell,
  cellSize: number,
) {
  fillPolygonWithCircle(ctx, cell, colors.END_CELL, cellSize);

  drawTextInCell(ctx, cell, cellSize, "F");
}

export function drawHoveredCell(
  ctx: CanvasRenderingContext2D,
  cell: PolygonCell,
  cellSize: number,
) {
  fillPolygonWithCircle(ctx, cell, colors.HOVERED_CELL, cellSize);
}
