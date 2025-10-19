import { CanvasLayer } from "@components/lib/CanvasLayer";
import { colors } from "@constants";
import { createCellFinder } from "@models/maze";
import { fillPolygonWithCircle } from "@models/maze-canvas-rendering";
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
    function (ctx: CanvasRenderingContext2D, width: number) {
      if (!ctx || width === 0 || !cells || !startId || !endId) return;

      const cellSize = width / columns;

      ctx.reset();

      const startCell = findCell(startId);

      if (startCell)
        fillPolygonWithCircle(ctx, startCell, colors.START_CELL, cellSize);

      const endCell = findCell(endId);

      if (endCell)
        fillPolygonWithCircle(ctx, endCell, colors.END_CELL, cellSize);
    },
    [cells, startId, endId, columns],
  );

  return <CanvasLayer onRender={renderCellMarks} />;
};
