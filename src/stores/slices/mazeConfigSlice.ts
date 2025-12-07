import {
  CellSelectionMode,
  DEFAULT_CELL_SELECTION,
  DEFAULT_COLUMNS_AMOUNT,
  DEFAULT_ROWS_AMOUNT,
} from "@constants";
import {
  DEFAULT_MAZE_SOLVER_ID,
  MazeMode,
  algoRegistry,
} from "@models/algorithm-registry";
import {
  MazeSize,
  RectMaze,
  generateRectMazeId,
  getDefaultMazeData,
  getEndCellDefaultPositon,
} from "@models/maze";
import { clearHistory } from "@models/wall-history";
import { MainStore } from "@stores/index";
import { StateCreator } from "zustand";

type State = {
  startId: string;
  endId: string;
  cellSelection: CellSelectionMode;
  mazeSolverId: number;
  displayMode: null | string;
  mazeGenerationAlgorithmId: number;
  rowsAmount: RectMaze["rows"];
  columnsAmount: RectMaze["cols"];
};

type Action = {
  setCellSelection: (cellSelection: State["cellSelection"]) => void;
  setStartId: (startId: State["startId"]) => void;
  setEndId: (endId: State["endId"]) => void;
  setMazeSolverId: (mazeSolverName: string) => void;
  setDisplayMode: (displayMode: State["displayMode"]) => void;
  updateMazeSize: (size: Partial<MazeSize>) => Promise<void>;
  updateMazeGenerationAlgorithm: (newAlgorithm: string) => Promise<void>;
};

export type MazeConfigSlice = State & Action;

export const createMazeConfigSlice: StateCreator<
  MainStore,
  [["zustand/immer", never]],
  [["zustand/immer", never]],
  MazeConfigSlice
> = (set, get) => ({
  startId: generateRectMazeId(0, 0),
  endId: getEndCellDefaultPositon({
    rows: DEFAULT_ROWS_AMOUNT,
    cols: DEFAULT_COLUMNS_AMOUNT,
  }),
  cellSelection: DEFAULT_CELL_SELECTION,
  mazeSolverId: DEFAULT_MAZE_SOLVER_ID,
  displayMode: null,
  rowsAmount: DEFAULT_ROWS_AMOUNT,
  columnsAmount: DEFAULT_COLUMNS_AMOUNT,
  mazeGenerationAlgorithmId: algoRegistry.getGroup(MazeMode.generation)[0],

  setCellSelection(cellSelection) {
    set({ cellSelection });
  },

  setStartId(startId) {
    set({ startId });
  },

  setEndId(endId) {
    set({ endId });
  },

  setMazeSolverId: (mazeSolverName) => {
    const newMazeSolverId = algoRegistry.getIdByName(mazeSolverName);

    if (newMazeSolverId !== get().mazeSolverId) {
      get().resetSolution();

      set({
        mazeSolverId: newMazeSolverId,
      });
    }
  },

  setDisplayMode(displayMode) {
    set({ displayMode });
  },

  async updateMazeSize({ rows, cols }) {
    if (rows === undefined) rows = get().rowsAmount;
    if (cols === undefined) cols = get().columnsAmount;

    if (
      (rows === get().rowsAmount && cols === get().columnsAmount) ||
      get().isMazeRendering
    )
      return;

    await get().resetMaze();

    set({
      rowsAmount: rows,
      columnsAmount: cols,
      endId: getEndCellDefaultPositon({ rows, cols }),
      mazeData: getDefaultMazeData(),
    });
  },

  updateMazeGenerationAlgorithm: async (newAlgorithm) => {
    const newMazeGeneratorId = algoRegistry.getIdByName(newAlgorithm);

    if (newMazeGeneratorId !== get().mazeGenerationAlgorithmId) {
      await get().resetMaze();

      set({
        mazeGenerationAlgorithmId: newMazeGeneratorId,
        wallHistory: clearHistory(),
      });
    }
  },
});
