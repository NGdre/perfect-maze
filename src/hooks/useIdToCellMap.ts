import { createIdToCellMap } from "@models/maze";
import { useMazeCells } from "@stores/selectors";

import { useMemo } from "react";

export function useIdToCellMap() {
  const cells = useMazeCells() || [];

  return useMemo(() => {
    return createIdToCellMap(cells);
  }, [cells]);
}
