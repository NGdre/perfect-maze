import { CanvasLayer } from "@components/lib/CanvasLayer";
import { WALLS_WIDTH, colors } from "@constants";
import { drawWalls, drawWallsNew } from "@models/maze-canvas-rendering";
import { useMazeStore } from "@stores/maze-store";
import { useColumnsAmount, useMazeCells } from "@stores/selectors";
import { cloneDeep } from "lodash";
import {
  getVisibleWalls,
  mapPairsToNeighbors,
  removeWalls,
  removeWallsBetweenCells,
  removeWallsPure,
} from "src/models/maze";
import { getHistoryState } from "src/models/wall-history";

import { useCallback } from "react";

export const MazeCanvasLayer = () => {
  const columns = useColumnsAmount();
  const cells = useMazeCells();

  const initMaze = useMazeStore((state) => state.initMaze);

  const wallHistoryState = useMazeStore((state) =>
    getHistoryState(state.wallHistory),
  );

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

      // cloning because methods mutating cells
      // const cellsCopy = cloneDeep(cells);

      // removeWallsBetweenCells(cellsCopy, wallHistoryState);

      // drawWalls(ctx, cellsCopy, {
      //   lineWidth: WALLS_WIDTH,
      //   wallColor: colors.WALL_COLOR,
      //   scaleFactor: cellSize,
      // });
    },
    [columns, cells, wallHistoryState, mazeData],
  );

  return <CanvasLayer onRender={renderMaze} />;
};
