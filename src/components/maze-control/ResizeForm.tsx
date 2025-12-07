import {
  useColumnsAmount,
  useIsMazeRendering,
  useRowsAmount,
} from "@stores/selectors";
import { debounce } from "@utils";

import {
  MAX_COLUMNS,
  MAX_ROWS,
  MIN_COLUMNS,
  MIN_ROWS,
  UPDATE_MAZE_SIZE_DELAY,
} from "../../constants";
import { useMazeStore } from "../../stores/maze-store";
import SelectNumber from "../lib/SelectNumber";

const ROWS_LABEL = "строки";
const COLUMN_LABEL = "столбцы";

const classNames = {
  resizeFormWrapper: "flex mt-5 space-x-6",
};

export function SelectRows({ ...props }) {
  const rowsAmount = useRowsAmount();
  const updateMazeSize = useMazeStore((state) => state.updateMazeSize);

  const updateRowsAmount = debounce(async (rows: number) => {
    await updateMazeSize({ rows });
  }, UPDATE_MAZE_SIZE_DELAY);

  return (
    <SelectNumber
      labelContent={ROWS_LABEL}
      value={rowsAmount}
      min={MIN_ROWS}
      max={MAX_ROWS}
      onSelect={updateRowsAmount}
      {...props}
    />
  );
}

export function SelectColumns({ ...props }) {
  const columnsAmount = useColumnsAmount();
  const updateMazeSize = useMazeStore((state) => state.updateMazeSize);

  const updateColumnsAmount = debounce(async (cols: number) => {
    await updateMazeSize({ cols });
  }, UPDATE_MAZE_SIZE_DELAY);

  return (
    <SelectNumber
      labelContent={COLUMN_LABEL}
      value={columnsAmount}
      min={MIN_COLUMNS}
      max={MAX_COLUMNS}
      onSelect={updateColumnsAmount}
      {...props}
    />
  );
}

export default function ResizeForm() {
  const isMazeRendering = useIsMazeRendering();
  return (
    <div className={classNames.resizeFormWrapper}>
      <SelectRows disabled={isMazeRendering} />
      <SelectColumns disabled={isMazeRendering} />
    </div>
  );
}
