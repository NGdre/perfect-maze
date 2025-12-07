import tailwindColors from "tailwindcss/colors";

import { hexToRgb } from "./models/color-interpolation";

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
  PATH_COLOR: "#ffb703",
  VISITED_CELL: "#b0c4b1",
  ENQUEUED_CELL: "#023047",
  primary: tailwindColors.blue,
  accent: tailwindColors.purple,
  "text-primary": tailwindColors.gray[600],
  "bg-primary": tailwindColors.indigo[50],
  "blue-25": "#fafcff",
  heatmapRGBStops: [
    hexToRgb(tailwindColors.violet[500]),
    hexToRgb(tailwindColors.teal[500]),
  ],
} as const;

export const PATH_WIDTH = 2;
export const WALLS_WIDTH = 1;

export const FILL_TO_CELL_RATIO = 0.5;

export const VISIALIZATION_ANIMATION_DELAY = 10;
export const CELL_SELECTION_THROTTLE_DELAY = 0;
export const UPDATE_MAZE_SIZE_DELAY = 500;

export const cellSelectionMode = {
  none: "none",
  start: "start",
  end: "end",
} as const;

export type CellSelectionMode = keyof typeof cellSelectionMode;

export const DEFAULT_CELL_SELECTION = cellSelectionMode.none;

export const INITIAL_MAX_PATH_DISTANCE = 0;

export const searchParams = {
  MAZE_GENERATOR: "mazeGenerator",
  MAZE_SOLVER: "mazeSolver",
  DISPLAY_MODE: "displayMode",
} as const;

export const pathSegments = {
  visualization: "visualization",
  generation: "generation",
  "path-finding": "path-finding",
} as const;

export const routes = {
  generation: `/${pathSegments.visualization}/${pathSegments.generation}`,
  "path-finding": `/${pathSegments.visualization}/${pathSegments["path-finding"]}`,
} as const;
