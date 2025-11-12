import { CanvasLayer } from "@components/lib/CanvasLayer";
import { PATH_WIDTH } from "@constants";
import { clearCellArea, drawLine } from "@models/maze-canvas-rendering";
import {
  useColumnsAmount,
  useCurrVisualMazeChange,
  useIsCellHistoryEmpty,
} from "@stores/selectors";
import { useIdToCellMap } from "src/hooks/useIdToCellMap";

import { useCallback, useRef } from "react";

export const MazePathCanvasLayer = () => {
  const cameFrom = useRef(new Map<string, string>());

  const change = useCurrVisualMazeChange();

  const isCellHistoryEmpty = useIsCellHistoryEmpty();
  const columns = useColumnsAmount();

  const idToCellMap = useIdToCellMap();

  const renderPath = useCallback(
    function (ctx: CanvasRenderingContext2D, width: number, height: number) {
      if (width === 0) return;

      if (isCellHistoryEmpty) ctx.clearRect(0, 0, width, height);

      if (columns === 0 || !change || !idToCellMap) return;

      const cellSize = width / columns;

      for (const cellChange of change) {
        const currCell = idToCellMap.get(cellChange.id);

        if (!currCell) continue;

        const isPathCell = cellChange.isPathCell;

        const isRenderPathBranch = [isPathCell, cellChange.prevCellId];

        const isClearPathBranch = [
          !isPathCell,
          cameFrom.current.has(currCell.id),
          !cellChange.prevCellId,
        ];

        if (isRenderPathBranch.every(Boolean)) {
          const prevCell = idToCellMap.get(cellChange.prevCellId as string);

          if (!prevCell) continue;

          cameFrom.current.set(currCell.id, prevCell.id);

          const connectDots = drawLine({
            ctx,
            strokeStyle: cellChange.lineColor as string,
            lineWidth: PATH_WIDTH,
            scaleFactor: cellSize,
          });

          connectDots(
            prevCell.center.x,
            prevCell.center.y,
            currCell.center.x,
            currCell.center.y,
          );
        }

        if (isClearPathBranch.every(Boolean)) {
          cameFrom.current.delete(currCell.id);

          clearCellArea(ctx, currCell, cellSize);
        }
      }
    },
    [change, isCellHistoryEmpty, columns, idToCellMap],
  );
  return <CanvasLayer onRender={renderPath} />;
};
