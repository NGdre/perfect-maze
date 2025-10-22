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

import { useCallback } from "react";

const ERASE_CELL_RATIO = 1;

export const InnerStateOfAlgoCanvasLayer = () => {
  const change = useCurrVisualMazeChange();
  const isCellHistoryEmpty = useIsCellHistoryEmpty();
  const cells = useMazeCells();
  const columns = useColumnsAmount();

  const renderPath = useCallback(
    function (ctx: CanvasRenderingContext2D, width: number) {
      if (isCellHistoryEmpty) ctx.clearRect(0, 0, 9999, 9999);

      if (width === 0 || columns === 0 || !change || !cells) return;

      const cellSize = width / columns;

      const idToCellMap = createIdToCellMap(cells);

      for (const cellChange of change) {
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
    [change, isCellHistoryEmpty, cells, columns],
  );

  return <CanvasLayer onRender={renderPath} preserveState={true} />;
};
