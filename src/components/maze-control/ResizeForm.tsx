import {
  MAX_COLUMNS,
  MAX_ROWS,
  MIN_COLUMNS,
  MIN_ROWS,
  UPDATE_MAZE_SIZE_DELAY,
  searchParams,
} from "@constants";
import { useSyncUrlParam } from "@hooks/useSyncUrlParam";
import { useMazeStore } from "@stores";
import { useIsMazeRendering } from "@stores/selectors";
import { debounce, flow } from "@utils";

import SelectNumber from "../lib/SelectNumber";

const ROWS_LABEL = "строки";
const COLUMN_LABEL = "столбцы";

export default function ResizeForm() {
  const isMazeRendering = useIsMazeRendering();

  const updateMazeSize = useMazeStore((state) => state.updateMazeSize);

  const { updateParamInUrl: updateRowsAmount, currentParamValue: rowsAmount } =
    useSyncUrlParam(
      searchParams.ROWS_AMOUNT,
      flow(Number, async (rows: number) => {
        await updateMazeSize({ rows });
      }),
    );

  const {
    updateParamInUrl: updateColumnsAmount,
    currentParamValue: columnsAmount,
  } = useSyncUrlParam(
    searchParams.COLUMNS_AMOUNT,
    flow(Number, async (cols: number) => {
      await updateMazeSize({ cols });
    }),
  );

  return (
    <div className="!mt-10 flex space-x-6 rounded-sm">
      <SelectNumber
        labelContent={ROWS_LABEL}
        initialValue={rowsAmount}
        min={MIN_ROWS}
        max={MAX_ROWS}
        onSelect={debounce(
          flow(String, updateRowsAmount),
          UPDATE_MAZE_SIZE_DELAY,
        )}
        disabled={isMazeRendering}
      />

      <SelectNumber
        labelContent={COLUMN_LABEL}
        initialValue={columnsAmount}
        min={MIN_COLUMNS}
        max={MAX_COLUMNS}
        onSelect={debounce(
          flow(String, updateColumnsAmount),
          UPDATE_MAZE_SIZE_DELAY,
        )}
        disabled={isMazeRendering}
      />
    </div>
  );
}
