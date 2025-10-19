import tailwindColors from "tailwindcss/colors";

export const DEFAULT_ROWS_AMOUNT = 20;
export const DEFAULT_COLUMNS_AMOUNT = 40;

export const MIN_ROWS = 5;
export const MAX_ROWS = 100;
export const MIN_COLUMNS = 5;
export const MAX_COLUMNS = 100;

export const PROJECT_NAME = "Perfect Maze";

export const colors = {
  WALL_COLOR: "#5f0f40",
  EMPTY_CELL: "white",
  START_CELL: "green",
  END_CELL: "pink",
  HOVERED_CELL: "purple",
  PATH_COLOR: "red",
  primary: tailwindColors.blue,
  accent: tailwindColors.purple,
  "text-primary": tailwindColors.gray[600],
  "bg-primary": tailwindColors.indigo[50],
  "blue-25": "#fafcff",
} as const;

export const PATH_WIDTH = 2;
export const WALLS_WIDTH = 0.5;

export const FILL_TO_CELL_RATIO = 0.5;

export const localStorageKeys = {
  MAZE_MATRIX: "maze-matrix",
} as const;

export const VISIALIZATION_ANIMATION_DELAY = 10;
export const CELL_SELECTION_THROTTLE_DELAY = 0;

export const CELL_ID_DELIMITER = ",";

export const workTypes = {
  mazeGeneration: "mazeGeneration",
  renderOnly: "renderOnly",
  idle: "idle",
} as const;
