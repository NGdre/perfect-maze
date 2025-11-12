import { CanvasLayer } from "@components/lib/CanvasLayer";
import { FILL_TO_CELL_RATIO } from "@constants";
import { clearCellArea, drawCell } from "@models/maze-canvas-rendering";
import { useMazeStore } from "@stores";
import {
  useColumnsAmount,
  useCurrVisualMazeChange,
  useIsCellHistoryEmpty,
} from "@stores/selectors";
import { useIdToCellMap } from "src/hooks/useIdToCellMap";

import { useCallback } from "react";

export const InnerStateOfAlgoCanvasLayer = () => {
  const change = useCurrVisualMazeChange();
  const isCellHistoryEmpty = useIsCellHistoryEmpty();
  const cellHistoryState = useMazeStore((state) =>
    state.cellHistory.getState(),
  );

  const isUndoOperation = useMazeStore((state) => state.isUndoOperation);

  const columns = useColumnsAmount();

  const idToCellMap = useIdToCellMap();

  const renderPath = useCallback(
    function (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      _dpr: number,
      isResized: boolean,
    ) {
      if (width === 0) return;

      if (isCellHistoryEmpty || isResized) ctx.clearRect(0, 0, width, height);

      if (columns === 0 || !change || !idToCellMap) return;

      const cellSize = width / columns;

      const shouldRedraw = isResized;

      const changes = shouldRedraw ? [...cellHistoryState.values()] : change;

      for (const cellChange of changes) {
        const currCell = idToCellMap.get(cellChange.id);

        if (!currCell) continue;

        const isPathCell = cellChange.isPathCell;

        if (isPathCell || !cellChange.color) {
          clearCellArea(ctx, currCell, cellSize);

          continue;
        }

        drawCell(ctx, currCell, cellSize, {
          scaleFromCenterFactor: FILL_TO_CELL_RATIO,
          background: cellChange.color as string,
        });
      }
    },
    [
      change,
      isCellHistoryEmpty,
      columns,
      cellHistoryState,
      idToCellMap,
      isUndoOperation,
    ],
  );

  return <CanvasLayer onRender={renderPath} />;
};
