import { CanvasLayer } from "@components/lib/CanvasLayer";
import { PATH_WIDTH } from "@constants";
import { createIdToCellMap } from "@models/maze";
import { drawLine } from "@models/maze-canvas-rendering";
import {
  useColumnsAmount,
  useCurrVisualMazeChange,
  useIsCellHistoryEmpty,
  useMazeCells,
} from "@stores/selectors";

import { useCallback, useRef } from "react";

export const MazePathCanvasLayer = () => {
  const cameFrom = useRef(new Map<string, string>());

  const change = useCurrVisualMazeChange();
  const cells = useMazeCells();
  const isCellHistoryEmpty = useIsCellHistoryEmpty();
  const columns = useColumnsAmount();

  const renderPath = useCallback(
    function (ctx: CanvasRenderingContext2D, width: number) {
      if (!ctx || width === 0 || columns === 0) return;

      if (isCellHistoryEmpty) ctx.clearRect(0, 0, 9999, 9999);

      const cellSize = width / columns;

      if (change && cells) {
        const idToCellMap = createIdToCellMap(cells);

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
              strokeStyle: cellChange.lineColor as string | undefined,
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
            const prevCellId = cameFrom.current.get(currCell.id);
            cameFrom.current.delete(currCell.id);

            if (!prevCellId) continue;

            const prevCell = idToCellMap.get(prevCellId);

            if (!prevCell) continue;

            // erasing path
            ctx.globalCompositeOperation = "destination-out";

            // scaleFactor exist because if you don't use it, then there are visual remnants of erased line
            const scaleFactor = 2;

            const connectDots = drawLine({
              ctx,
              lineWidth: PATH_WIDTH * scaleFactor,
              scaleFactor: cellSize,
            });

            connectDots(
              prevCell.center.x,
              prevCell.center.y,
              currCell.center.x,
              currCell.center.y,
            );

            ctx.globalCompositeOperation = "source-over";
          }
        }
      }
    },
    [change, isCellHistoryEmpty, cells, columns],
  );
  return <CanvasLayer onRender={renderPath} />;
};
