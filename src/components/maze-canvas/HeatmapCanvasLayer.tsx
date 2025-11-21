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
  useMaxPathDistance,
  useStartId,
} from "@stores/selectors";
import { useIdToCellMap } from "src/hooks/useIdToCellMap";
import { manhattanDistance } from "src/models/solvers/heuristics";

import { useCallback, useEffect } from "react";

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

  const maxPathDistance = useMaxPathDistance();
  const setMaxPathDistance = useMazeStore((state) => state.setMaxPathDistance);

  useEffect(() => {
    setMaxPathDistance(0);
  }, [endId, startId, setMaxPathDistance]);

  useEffect(() => {
    const goal = idToCellMap.get(endId);
    if (!goal) throw new Error("can not find goal id");
    if (columns === 0) return;

    let currentMax = 0;

    // recomputing currentMax value from history state for simplicity even with incremental changes
    for (const cellChange of cellHistoryState.values()) {
      if (cellChange.isPathCell || !cellChange.heatmapValue) continue;

      const currCell = idToCellMap.get(cellChange.id);
      if (!currCell) continue;

      // hardcoded distance function
      const dist = manhattanDistance(currCell.center, goal.center);
      currentMax = Math.max(dist, currentMax);
    }

    if (currentMax !== maxPathDistance) {
      setMaxPathDistance(currentMax);
    }
  }, [
    endId,
    cellHistoryState,
    idToCellMap,
    columns,
    maxPathDistance,
    setMaxPathDistance,
  ]);

  const renderLayer = useCallback(
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

        if (!currCell) {
          console.log(cellChange.id);
          continue;
        }

        // if (!currCell)
        //   throw new Error("can not find current cell in HeatmapCanvasLayer");

        const isPathCell = cellChange.isPathCell;

        if (isPathCell || !cellChange.heatmapValue) {
          clearCellArea(ctx, currCell, cellSize);
          continue;
        }

        // min value for heatmapValue is probably always 0
        const cellColor = interpolateColor(
          0,
          maxPathDistance,
          colors.heatmapRGBStops,
        )(cellChange.heatmapValue as number);

        drawCell(ctx, currCell, cellSize, {
          scaleFromCenterFactor: FILL_TO_CELL_RATIO,
          background: cellColor,
        });
      }
    },
    [
      change,
      isCellHistoryEmpty,
      columns,
      cellHistoryState,
      idToCellMap,
      maxPathDistance,
    ],
  );

  return <CanvasLayer onRender={renderLayer} />;
};
