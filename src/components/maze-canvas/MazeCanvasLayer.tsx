import { CanvasLayer } from "@components/lib/CanvasLayer";
import { colors, WALLS_WIDTH } from "@constants";
import { drawWalls } from "@models/maze-canvas-rendering";
import { useCallback } from "react";
import { useMazeStore } from "@stores/maze-store";
import { useColumnsAmount, useMazeCells } from "@stores/selectors";
import {
  fillCellsWithOpenNeighbors,
  removeWallsBetweenCells,
} from "src/models/maze";
import { getHistoryState } from "src/models/wall-history";
import { cloneDeep } from "lodash";

export const MazeCanvasLayer = () => {
  const columns = useColumnsAmount();
  const cells = useMazeCells();

  const initMaze = useMazeStore((state) => state.initMaze);

  const wallHistoryState = useMazeStore((state) =>
    getHistoryState(state.wallHistory)
  );

  const renderMaze = useCallback(
    function (ctx: CanvasRenderingContext2D, width: number) {
      if (width === 0) return;

      const cellSize = width / columns;

      if (!cells) {
        initMaze(cellSize);
        return;
      }

      ctx.reset();

      // cloning because methods mutating cells
      const cellsCopy = cloneDeep(cells);

      removeWallsBetweenCells(cellsCopy, wallHistoryState);
      fillCellsWithOpenNeighbors(cellsCopy);

      drawWalls(ctx, cellsCopy, {
        lineWidth: WALLS_WIDTH,
        wallColor: colors.WALL_COLOR,
      });
    },
    [columns, cells, wallHistoryState]
  );

  return <CanvasLayer onRender={renderMaze} />;
};
