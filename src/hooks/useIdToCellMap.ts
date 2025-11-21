import { _createCellFinder, createIdToCellMap } from "@models/maze";
import { useMazeCells } from "@stores/selectors";
import { getHistoryState } from "src/models/wall-history";
import { useMazeStore } from "src/stores";

import { useMemo } from "react";

// export function useIdToCellMap() {
//   const cells = useMazeCells() || [];

//   return useMemo(() => {
//     return createIdToCellMap(cells);
//   }, [cells]);
// }

export function useIdToCellMap() {
  const mazeData = useMazeStore((state) => state.mazeData);
  const wallHistoryState = useMazeStore((state) =>
    getHistoryState(state.wallHistory),
  );

  const cellFinder = _createCellFinder(mazeData, wallHistoryState);

  return useMemo(() => {
    return {
      get(id: string) {
        return cellFinder(id);
      },
    };
  }, [mazeData, wallHistoryState]);
}
