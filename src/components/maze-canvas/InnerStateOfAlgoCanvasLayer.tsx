import { CanvasLayer } from "@components/lib/CanvasLayer";
import { FILL_TO_CELL_RATIO, colors } from "@constants";
import { drawPolygon } from "@models/maze-canvas-rendering";
import { useMazeStore } from "@stores";
import {
  useColumnsAmount,
  useCurrVisualMazeChange,
  useIsCellHistoryEmpty,
} from "@stores/selectors";
import { scalePolygonFromCenter } from "@utils";
import { useIdToCellMap } from "src/hooks/useIdToCellMap";

import { useCallback } from "react";

const ERASE_CELL_RATIO = 1;

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

      if (isCellHistoryEmpty || isResized || isUndoOperation)
        ctx.clearRect(0, 0, width, height);

      if (columns === 0 || !change || !idToCellMap) return;

      const cellSize = width / columns;

      const shouldRedraw = isResized || isUndoOperation;

      const changes = shouldRedraw ? [...cellHistoryState.values()] : change;

      for (const cellChange of changes) {
        const currCell = idToCellMap.get(cellChange.id);

        if (!currCell) continue;

        const isPathCell = cellChange.isPathCell;

        const drawPolygonArgs = isPathCell
          ? { scaleFactor: ERASE_CELL_RATIO, color: colors.EMPTY_CELL }
          : {
              scaleFactor: FILL_TO_CELL_RATIO,
              color:
                (cellChange.color as string | undefined) || colors.EMPTY_CELL,
            };

        drawPolygon(
          ctx,
          scalePolygonFromCenter(
            currCell.getPoints(cellSize),
            drawPolygonArgs.scaleFactor,
          ),
          drawPolygonArgs.color,
        );
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
