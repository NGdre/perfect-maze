import { CanvasLayer } from "@components/lib/CanvasLayer";
import { FILL_TO_CELL_RATIO, colors } from "@constants";
import { createIdToCellMap } from "@models/maze";
import { drawPolygon } from "@models/maze-canvas-rendering";
import {
  useColumnsAmount,
  useCurrVisualMazeChange,
  useIsCellHistoryEmpty,
  useMazeCells,
} from "@stores/selectors";
import { scalePolygonFromCenter } from "@utils";
import { useMazeStore } from "src/stores";

import { useCallback } from "react";

const ERASE_CELL_RATIO = 1;

export const InnerStateOfAlgoCanvasLayer = () => {
  const change = useCurrVisualMazeChange();
  const isCellHistoryEmpty = useIsCellHistoryEmpty();
  const cellHistoryState = useMazeStore((state) =>
    state.cellHistory.getState(),
  );

  const cells = useMazeCells();
  const columns = useColumnsAmount();

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

      if (columns === 0 || !change || !cells) return;

      const cellSize = width / columns;

      const idToCellMap = createIdToCellMap(cells);

      const shouldRedraw = isResized;

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
    [change, isCellHistoryEmpty, cells, columns, cellHistoryState],
  );

  return <CanvasLayer onRender={renderPath} />;
};
