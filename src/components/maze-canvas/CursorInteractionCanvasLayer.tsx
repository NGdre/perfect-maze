import { CanvasLayer } from "@components/lib/CanvasLayer";
import { CELL_SELECTION_THROTTLE_DELAY, colors } from "@constants";
import { ALGO_DISPLAY_MODES } from "@models/algorithm-registry";
import {
  MazeData,
  _createCellFinder,
  generateRectMazeId,
  getCellCenter,
} from "@models/maze";
import { fillPolygonWithCircle } from "@models/maze-canvas-rendering";
import { useMazeStore } from "@stores/maze-store";
import { useAlgoDisplayMode, useColumnsAmount } from "@stores/selectors";
import { CellSelectionModes } from "@stores/slices/mazeSolutionSlice";
import { flow, noop, throttle } from "@utils";
import ow from "ow";
import { useIdToCellMap } from "src/hooks/useIdToCellMap";

import { useCallback, useEffect, useRef, useState } from "react";
import { Tooltip } from "react-tooltip";

export type Position = [row: number, col: number];

// this works only for rect maze
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
  mazeData: MazeData;
  cellSize: number;
  cellSelection: CellSelectionModes;
  width: number;
  height: number;
}) {
  const { ctx, mazeData, cellSize, cellSelection, width, height } = config;

  const canvas = ctx.canvas;

  const cellColor = selectCellColor[cellSelection];

  const clearHoveredCell = () => {
    ctx.clearRect(0, 0, width, height);
  };

  const hoverCell = throttle((e: MouseEvent) => {
    const cellIndex = mazeData.indexByCellId.get(
      generateRectMazeId(...cellPositionOnCanvasHover(canvas, e, cellSize)),
    );

    if (cellIndex !== undefined) {
      const cellCenter = getCellCenter(mazeData, cellIndex);
      clearHoveredCell();
      fillPolygonWithCircle(ctx, { center: cellCenter }, cellColor, cellSize);
    }
  }, CELL_SELECTION_THROTTLE_DELAY);

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
  const mazeData = useMazeStore((state) => state.mazeData);
  const columns = useColumnsAmount();
  const cellSelection = useMazeStore((state) => state.cellSelection);
  const setStartId = useMazeStore((state) => state.setStartId);
  const setEndId = useMazeStore((state) => state.setEndId);
  const cellHistory = useMazeStore((state) => state.cellHistory);
  const algoDisplayMode = useAlgoDisplayMode();
  const idToCellMap = useIdToCellMap();

  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [cellSize, setCellSize] = useState(0);

  const defaultHeat = 0;
  const [heat, setHeat] = useState(defaultHeat);

  const cellPatchHeatProperty = "heatmapValue";
  const tooltipThrottleDelay = 100;

  useEffect(() => {
    const canvas = ctxRef.current?.canvas;

    if (!canvas || algoDisplayMode !== ALGO_DISPLAY_MODES.heatmap) return;

    const hoverCell = throttle((e: MouseEvent) => {
      const cell = idToCellMap.get(
        generateRectMazeId(...cellPositionOnCanvasHover(canvas, e, cellSize)),
      );

      if (cell) {
        const lastChange = cellHistory.getLastPropertyChange(
          cell.id,
          cellPatchHeatProperty,
        );

        if (lastChange) setHeat(lastChange.value as number);
        else setHeat(defaultHeat);
      }
    }, tooltipThrottleDelay);

    canvas.addEventListener("mousemove", hoverCell);

    return () => {
      canvas.removeEventListener("mousemove", hoverCell);
    };
  }, [cellSize, idToCellMap, cellHistory, algoDisplayMode]);

  const renderCursorInteraction = useCallback(
    function (ctx: CanvasRenderingContext2D, width: number, height: number) {
      if (!ctx || width === 0 || columns === 0) return;

      if (ctxRef.current !== ctx) ctxRef.current = ctx;

      const currCellSize = width / columns;

      if (currCellSize !== cellSize) setCellSize(currCellSize);

      const cleanUpHoverInteraction = hoverInteraction({
        ctx,
        mazeData,
        cellSize: currCellSize,
        cellSelection,
        width,
        height,
      });

      const cleanUpClickInteraction = clickInteraction({
        cellSize: currCellSize,
        ctx,
        cellSelection,
        onStart: setStartId,
        onEnd: setEndId,
      });

      return flow(cleanUpHoverInteraction, cleanUpClickInteraction);
    },
    [
      columns,
      cellSelection,
      mazeData,
      setCellSize,
      setStartId,
      setEndId,
      cellSize,
    ],
  );

  const tooltipContent = () => {
    return (
      <div>
        h-value is <span className="text-base font-bold">{heat}</span>
      </div>
    );
  };

  return (
    <>
      <div
        data-tooltip-id="canvas-tooltip"
        data-tooltip-float
        data-tooltip-offset={cellSize}
        data-tooltip-hidden={
          algoDisplayMode !== ALGO_DISPLAY_MODES.heatmap || heat === defaultHeat
        }
      >
        <CanvasLayer onRender={renderCursorInteraction} isInteractive />
      </div>

      <Tooltip
        id="canvas-tooltip"
        className="!rounded-lg !bg-black/50 !text-white !text-opacity-100 backdrop-blur-md"
        noArrow
        place="right"
        children={tooltipContent()}
      />
    </>
  );
};
