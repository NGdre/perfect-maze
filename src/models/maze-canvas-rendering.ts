import { loopPairs } from "@utils";
import ow from "ow";

import { Point2d, type PolygonCell } from "./maze";

type context2d = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

type lineCords = [number, number, number, number];

export function drawLine(config: {
  ctx: context2d;
  strokeStyle?: string;
  lineWidth?: number;
  batching?: boolean;
}) {
  const { strokeStyle, lineWidth, ctx, batching = false } = config;

  if (lineWidth) ctx.lineWidth = lineWidth;
  if (strokeStyle) ctx.strokeStyle = strokeStyle;

  function line(...cords: lineCords) {
    const [x1, y1, x2, y2] = cords;

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
  opts: { wallColor?: string; lineWidth?: number },
) {
  const len = cells.length;
  const color = opts.wallColor;
  const lineWidth = opts.lineWidth;

  const line = drawLine({ ctx, strokeStyle: color, lineWidth, batching: true });

  ctx.beginPath();

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
  fillFraction = 0.9,
) {
  ow(fillFraction, ow.number.positive.lessThanOrEqual(1));

  const { x, y } = cell.center;

  const halfCellLength = cell.edgeLength / 2;

  const radius = halfCellLength * fillFraction;

  fillWithCircle(ctx, x, y, radius, color);
}
