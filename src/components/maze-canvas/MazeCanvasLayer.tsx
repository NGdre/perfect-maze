import { CanvasLayer } from "@components/lib/CanvasLayer";
import { WALLS_WIDTH, colors } from "@constants";
import { getVisibleWalls, removeWallsPure } from "@models/maze";
import { drawWallsNew } from "@models/maze-canvas-rendering";
import { useMazeStore } from "@stores/maze-store";
import {
  useColumnsAmount,
  useMazeCells,
  useWallHistoryState,
} from "@stores/selectors";

import { useCallback } from "react";

export const MazeCanvasLayer = () => {
  const columns = useColumnsAmount();
  const cells = useMazeCells();

  const initMaze = useMazeStore((state) => state.initMaze);

  const wallHistoryState = useWallHistoryState();

  const mazeData = useMazeStore((state) => state.mazeData);

  const renderMaze = useCallback(
    function (ctx: CanvasRenderingContext2D, width: number, height: number) {
      if (width === 0) return;

      const cellSize = width / columns;

      if (!cells) {
        initMaze();
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const mazeDataWithRemovedWalls = removeWallsPure(
        mazeData,
        wallHistoryState,
      );

      drawWallsNew(ctx, getVisibleWalls(mazeDataWithRemovedWalls), {
        lineWidth: WALLS_WIDTH,
        wallColor: colors.WALL_COLOR,
        scaleFactor: cellSize,
      });
    },
    [columns, cells, wallHistoryState, mazeData],
  );

  return <CanvasLayer onRender={renderMaze} />;
};
