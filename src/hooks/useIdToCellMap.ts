import { _createCellFinder, mapPairsToNeighbors } from "@models/maze";
import { getHistoryState } from "@models/wall-history";
import { useMazeStore } from "@stores";

import { useMemo } from "react";

export function useIdToCellMap() {
  const mazeData = useMazeStore((state) => state.mazeData);
  const wallHistoryState = useMazeStore((state) =>
    getHistoryState(state.wallHistory),
  );

  const cellFinder = _createCellFinder(
    mazeData,
    mapPairsToNeighbors(mazeData, wallHistoryState),
  );

  return useMemo(() => {
    return {
      get(id: string) {
        return cellFinder(id);
      },
    };
  }, [mazeData, wallHistoryState]);
}
