import { createCellFinder, mapPairsToNeighbors } from "@models/maze";
import { useMazeStore } from "@stores";
import { useWallHistoryState } from "@stores/selectors";

import { useMemo } from "react";

export function useIdToCellMap() {
  const mazeData = useMazeStore((state) => state.mazeData);
  const wallHistoryState = useWallHistoryState();

  return useMemo(() => {
    const cellFinder = createCellFinder(
      mazeData,
      mapPairsToNeighbors(mazeData, wallHistoryState),
    );

    return {
      get(id: string) {
        return cellFinder(id);
      },
    };
  }, [mazeData, wallHistoryState]);
}
