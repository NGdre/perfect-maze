import { CanvasLayer } from "@components/lib/CanvasLayer";
import { CELL_SELECTION_THROTTLE_DELAY, colors } from "@constants";
import { RectMaze, createCellFinder, generateRectMazeId } from "@models/maze";
import { fillPolygonWithCircle } from "@models/maze-canvas-rendering";
import { useMazeStore } from "@stores/maze-store";
import { useColumnsAmount, useMazeCells } from "@stores/selectors";
import { CellSelectionModes } from "@stores/slices/mazeSolutionSlice";
import { flow, noop, throttle } from "@utils";
import ow from "ow";

import { useCallback } from "react";

export type Position = [row: number, col: number];

export const cellPositionOnCanvasHover = (
  canvas: HTMLCanvasElement,
  e: MouseEvent,
  cellSize: number,
): Position => {
  ow(cellSize, ow.number.positive);

  const rect = canvas.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const row = Math.floor(x / cellSize);
  const col = Math.floor(y / cellSize);

  return [col, row];
};

const selectCellColor = {
  start: colors.START_CELL,
  end: colors.END_CELL,
  none: colors.HOVERED_CELL,
};

function hoverInteraction(config: {
  ctx: CanvasRenderingContext2D;
  cells: RectMaze["cells"] | undefined;
  cellSize: number;
  cellSelection: CellSelectionModes;
}) {
  const { ctx, cells, cellSize, cellSelection } = config;

  if (!cells) return noop;

  const canvas = ctx.canvas;

  const findCell = createCellFinder(cells);
  const cellColor = selectCellColor[cellSelection];

  const hoverCell = throttle((e: MouseEvent) => {
    const cell = findCell(
      generateRectMazeId(...cellPositionOnCanvasHover(canvas, e, cellSize)),
    );

    if (cell) {
      ctx.reset();
      fillPolygonWithCircle(ctx, cell, cellColor);
    }
  }, CELL_SELECTION_THROTTLE_DELAY);

  const clearHoveredCell = () => {
    ctx.reset();
  };

  canvas.addEventListener("mousemove", hoverCell);
  canvas.addEventListener("mouseleave", clearHoveredCell);

  return () => {
    canvas.removeEventListener("mousemove", hoverCell);
    canvas.removeEventListener("mouseleave", clearHoveredCell);
  };
}

function clickInteraction(config: {
  ctx: CanvasRenderingContext2D;
  cellSize: number;
  cellSelection: CellSelectionModes;
  onStart: (startId: string) => void;
  onEnd: (endId: string) => void;
}) {
  const { ctx, cellSize, cellSelection, onStart, onEnd } = config;

  if (cellSize === 0 || cellSelection === "none") return noop;

  const canvas = ctx.canvas;

  const markCell = (e: MouseEvent) => {
    const id = generateRectMazeId(
      ...cellPositionOnCanvasHover(canvas, e, cellSize),
    );

    if (cellSelection === "start") onStart(id);
    if (cellSelection === "end") onEnd(id);
  };

  canvas.addEventListener("click", markCell);

  return () => {
    canvas.removeEventListener("click", markCell);
  };
}

export const CursorInteractionCanvasLayer = () => {
  const cells = useMazeCells();
  const columns = useColumnsAmount();
  const cellSelection = useMazeStore((state) => state.cellSelection);
  const setStartId = useMazeStore((state) => state.setStartId);
  const setEndId = useMazeStore((state) => state.setEndId);

  const renderCursorInteraction = useCallback(
    function (ctx: CanvasRenderingContext2D, width: number) {
      if (!ctx || width === 0 || columns === 0) return;

      const cellSize = width / columns;

      const cleanUpHoverInteraction = hoverInteraction({
        ctx,
        cells,
        cellSize,
        cellSelection,
      });

      const cleanUpClickInteraction = clickInteraction({
        cellSize,
        ctx,
        cellSelection,
        onStart: setStartId,
        onEnd: setEndId,
      });

      return flow(cleanUpHoverInteraction, cleanUpClickInteraction);
    },
    [columns, cellSelection, cells],
  );

  return (
    <CanvasLayer onRender={renderCursorInteraction} isInteractive={true} />
  );
};
