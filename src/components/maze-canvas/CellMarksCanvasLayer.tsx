import { CanvasLayer } from "@components/lib/CanvasLayer";
import { createCellFinder } from "@models/maze";
import { drawFinish, drawStart } from "@models/maze-canvas-rendering";
import {
  useColumnsAmount,
  useEndId,
  useMazeCells,
  useStartId,
} from "@stores/selectors";
import { identity } from "lodash";

import { useCallback } from "react";

export const CellMarksCanvasLayer = () => {
  const cells = useMazeCells();
  const startId = useStartId();
  const endId = useEndId();

  const columns = useColumnsAmount();

  const findCell = useCallback(cells ? createCellFinder(cells) : identity, [
    cells,
  ]);

  const renderCellMarks = useCallback(
    function (ctx: CanvasRenderingContext2D, width: number, height: number) {
      if (!ctx || width === 0 || !cells || !startId || !endId) return;

      const cellSize = width / columns;

      ctx.clearRect(0, 0, width, height);

      const startCell = findCell(startId);

      if (startCell) drawStart(ctx, startCell, cellSize);

      const endCell = findCell(endId);

      if (endCell) drawFinish(ctx, endCell, cellSize);
    },
    [cells, startId, endId, columns],
  );

  return <CanvasLayer onRender={renderCellMarks} />;
};
