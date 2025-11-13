import { CanvasLayer } from "@components/lib/CanvasLayer";
import { FILL_TO_CELL_RATIO, colors } from "@constants";
import { interpolateColor } from "@models/color-interpolation";
import { clearCellArea, drawCell } from "@models/maze-canvas-rendering";
import { useMazeStore } from "@stores";
import {
  useColumnsAmount,
  useCurrVisualMazeChange,
  useEndId,
  useIsCellHistoryEmpty,
  useStartId,
} from "@stores/selectors";
import { useIdToCellMap } from "src/hooks/useIdToCellMap";
import { manhattanDistance } from "src/models/solvers/heuristics";

import { useCallback, useEffect, useRef } from "react";

export const HeatmapCanvasLayer = () => {
  const change = useCurrVisualMazeChange();
  const isCellHistoryEmpty = useIsCellHistoryEmpty();
  const cellHistoryState = useMazeStore((state) =>
    state.cellHistory.getState(),
  );

  const columns = useColumnsAmount();

  const idToCellMap = useIdToCellMap();

  const endId = useEndId();
  const startId = useStartId();

  const maxRef = useRef(0);

  useEffect(() => {
    maxRef.current = 0;
  }, [endId, startId]);

  const goal = idToCellMap.get(endId);

  if (!goal) throw new Error("can not find goal id");

  const renderPath = useCallback(
    function (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      _dpr: number,
      isResized: boolean,
    ) {
      if (width === 0) return;

      if (isCellHistoryEmpty || isResized) {
        ctx.clearRect(0, 0, width, height);
      }

      if (columns === 0 || !change) return;

      const cellSize = width / columns;

      const shouldRedraw = isResized;

      const changes = shouldRedraw ? [...cellHistoryState.values()] : change;

      for (const cellChange of changes) {
        const currCell = idToCellMap.get(cellChange.id);

        if (!currCell)
          throw new Error("can not find current cell in HeatmapCanvasLayer");

        const isPathCell = cellChange.isPathCell;

        if (isPathCell || !cellChange.heatmapValue) {
          clearCellArea(ctx, currCell, cellSize);

          continue;
        }

        const currCellCenter = currCell.center;
        const currGoalCenter = goal.center;

        // hardcoded distance function
        const dist = manhattanDistance(
          { x: currCellCenter.x, y: currCellCenter.y },
          { x: currGoalCenter.x, y: currGoalCenter.y },
        );

        maxRef.current = Math.max(dist, maxRef.current);

        // min value for heatmapValue is probably always 0
        const cellColor = interpolateColor(
          0,
          maxRef.current,
          colors.heatmapRGBStops,
        )(cellChange.heatmapValue as number);

        drawCell(ctx, currCell, cellSize, {
          scaleFromCenterFactor: FILL_TO_CELL_RATIO,
          background: cellColor,
        });
      }
    },
    [change, isCellHistoryEmpty, columns, cellHistoryState, idToCellMap, endId],
  );

  return <CanvasLayer onRender={renderPath} />;
};
