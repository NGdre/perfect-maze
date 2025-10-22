import { createIdToCellMap } from "@models/maze";
import { useMazeCells } from "@stores/selectors";

import { useMemo } from "react";

export function useIdToCellMap() {
  const cells = useMazeCells();

  return useMemo(() => {
    if (!cells) return null;

    return createIdToCellMap(cells);
  }, [cells]);
}
