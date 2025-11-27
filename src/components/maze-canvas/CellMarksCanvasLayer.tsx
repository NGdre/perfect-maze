import { CanvasLayer } from "@components/lib/CanvasLayer";
import { getCellCenter, getCellPoints } from "@models/maze";
import {
  ObjectWithGetPointsAndCenter,
  drawFinish,
  drawStart,
} from "@models/maze-canvas-rendering";
import { useMazeStore } from "@stores";
import {
  useColumnsAmount,
  useEndId,
  useMazeCells,
  useStartId,
} from "@stores/selectors";

import { useCallback } from "react";

export const CellMarksCanvasLayer = () => {
  const cells = useMazeCells();
  const startId = useStartId();
  const endId = useEndId();
  const mazeData = useMazeStore((state) => state.mazeData);

  const columns = useColumnsAmount();

  const renderCellMarks = useCallback(
    function (ctx: CanvasRenderingContext2D, width: number, height: number) {
      if (!ctx || width === 0 || !cells || !startId || !endId) return;

      const cellSize = width / columns;

      ctx.clearRect(0, 0, width, height);

      const drawMark = (
        cellId: string,
        drawingFn: (
          ctx: CanvasRenderingContext2D,
          cell: ObjectWithGetPointsAndCenter,
          cellSize: number,
        ) => void,
      ) => {
        const cellIndex = mazeData.indexByCellId.get(cellId);

        if (cellIndex !== undefined) {
          const cellCenter = getCellCenter(mazeData, cellIndex);
          const cellData = {
            center: cellCenter,
            getPoints: (scaleFactor: number) =>
              getCellPoints(mazeData, cellIndex, scaleFactor),
          };

          drawingFn(ctx, cellData, cellSize);
        }
      };

      drawMark(startId, drawStart);
      drawMark(endId, drawFinish);
    },
    [cells, startId, endId, columns, mazeData],
  );

  return <CanvasLayer onRender={renderCellMarks} />;
};
