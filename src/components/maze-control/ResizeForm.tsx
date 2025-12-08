import {
  MAX_COLUMNS,
  MAX_ROWS,
  MIN_COLUMNS,
  MIN_ROWS,
  UPDATE_MAZE_SIZE_DELAY,
} from "@constants";
import { useMazeStore } from "@stores";
import {
  useColumnsAmount,
  useIsMazeRendering,
  useRowsAmount,
} from "@stores/selectors";
import { debounce } from "@utils";

import SelectNumber from "../lib/SelectNumber";

const ROWS_LABEL = "строки";
const COLUMN_LABEL = "столбцы";

export default function ResizeForm() {
  const isMazeRendering = useIsMazeRendering();
  const rowsAmount = useRowsAmount();
  const columnsAmount = useColumnsAmount();

  const updateMazeSize = useMazeStore((state) => state.updateMazeSize);

  const updateRowsAmount = debounce(async (rows: number) => {
    await updateMazeSize({ rows });
  }, UPDATE_MAZE_SIZE_DELAY);

  const updateColumnsAmount = debounce(async (cols: number) => {
    await updateMazeSize({ cols });
  }, UPDATE_MAZE_SIZE_DELAY);

  return (
    <div className="!mt-10 flex space-x-6 rounded-sm">
      <SelectNumber
        labelContent={ROWS_LABEL}
        initialValue={rowsAmount}
        min={MIN_ROWS}
        max={MAX_ROWS}
        onSelect={updateRowsAmount}
        disabled={isMazeRendering}
      />

      <SelectNumber
        labelContent={COLUMN_LABEL}
        initialValue={columnsAmount}
        min={MIN_COLUMNS}
        max={MAX_COLUMNS}
        onSelect={updateColumnsAmount}
        disabled={isMazeRendering}
      />
    </div>
  );
}
