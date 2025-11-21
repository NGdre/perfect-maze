import { DEFAULT_COLUMNS_AMOUNT, DEFAULT_ROWS_AMOUNT } from "@constants";
import {
  MazeData,
  RectMaze,
  createMaze,
  createRectMaze,
  generateRectMazeId,
  getDefaultMazeData,
} from "@models/maze";
import { MainStore } from "@stores";
import { mapGenerator } from "@utils";
import { MazeMode, algoRegistry } from "src/models/algorithm-registry";
import {
  WallHistorySnapshot,
  backwardHistory,
  clearHistory,
  createWallHistory,
  forwardHistory,
  isHistoryEmpty,
  saveHistoryChange,
  saveHistoryChanges,
} from "src/models/wall-history";
import { StateCreator } from "zustand";

import { TimeDirection } from "./mazeSolutionSlice";

type State = {
  mazeInstance: RectMaze | null;
  mazeData: MazeData;
  mazeGenerationAlgorithmId: number;
  rowsAmount: RectMaze["rows"];
  columnsAmount: RectMaze["cols"];
  serialGenerator: Generator<any, void, any> | null;
  wallHistory: WallHistorySnapshot;
  isMazeGenerationDone: boolean;
};

type Action = {
  updateRowsAmount: (newRowsAmount: State["rowsAmount"]) => void;
  updateColumnsAmount: (newColumnsAmount: State["columnsAmount"]) => void;

  updateMazeGenerationAlgorithm: (newAlgorithm: string) => void;

  initMaze: () => void;
  generateMaze: () => void;
  takeStepInGeneration: (direction: TimeDirection) => boolean;
  resetMaze: () => void;
};

export type MazeGenerationSlice = State & Action;

export const createMazeGenerationSlice: StateCreator<
  MainStore,
  [["zustand/immer", never]],
  [["zustand/immer", never]],
  MazeGenerationSlice
> = (set, get) => ({
  rowsAmount: DEFAULT_ROWS_AMOUNT,
  columnsAmount: DEFAULT_COLUMNS_AMOUNT,
  mazeGenerationAlgorithmId: algoRegistry.getGroup(MazeMode.generation)[0],
  mazeInstance: null,
  serialGenerator: null,
  wallHistory: createWallHistory(),
  isMazeGenerationDone: false,
  mazeData: getDefaultMazeData(),

  updateRowsAmount: (newRowsAmount) => set({ rowsAmount: newRowsAmount }),

  updateColumnsAmount: (newColumnsAmount) =>
    set({ columnsAmount: newColumnsAmount }),

  updateMazeGenerationAlgorithm: (newAlgorithm) =>
    set({
      mazeGenerationAlgorithmId: algoRegistry.getIdByName(newAlgorithm),
      wallHistory: clearHistory(),
      serialGenerator: null,
      isMazeGenerationDone: false,
    }),

  initMaze() {
    const rows = get().rowsAmount;
    const cols = get().columnsAmount;

    set({
      endId: generateRectMazeId(rows - 1, cols - 1),
    });

    const mazeData = createMaze(rows, cols);

    const maze = createRectMaze(rows, cols);

    set({ mazeInstance: maze, mazeData });
  },

  resetMaze() {
    set({
      wallHistory: clearHistory(),
      isMazeGenerationDone: false,
    });
  },

  // return true if serialGenerator is done, otherwise false
  takeStepInGeneration: (direction: TimeDirection) => {
    const wallHistory = get().wallHistory;

    if (direction === "backward") {
      set({ wallHistory: backwardHistory(wallHistory) });
      return true;
    }

    const canRedo = wallHistory.currentIndex < wallHistory.history.length - 1;

    if (canRedo) {
      set({ wallHistory: forwardHistory(wallHistory) });
      return true;
    }

    const rows = get().rowsAmount;
    const cols = get().columnsAmount;
    let serialGenerator = get().serialGenerator;

    if (isHistoryEmpty(wallHistory)) {
      const currGeneratorAlgoId = get().mazeGenerationAlgorithmId;

      const mazeGenerator = algoRegistry.findAlgoById(currGeneratorAlgoId);

      serialGenerator = mapGenerator(mazeGenerator(rows, cols), (pair) => [
        pair[0].id,
        pair[1].id,
      ]);

      set({ serialGenerator, isMazeGenerationDone: false });
    }

    const next = serialGenerator?.next();

    if (next && next.done) {
      set({ isMazeGenerationDone: true });
      return false;
    }

    if (next && !next.done) {
      set({ wallHistory: saveHistoryChange(wallHistory, next.value) });

      return true;
    }

    return false;
  },

  generateMaze() {
    const rows = get().rowsAmount;
    const cols = get().columnsAmount;
    const wallHistory = get().wallHistory;

    let serialGenerator = get().serialGenerator;

    if (isHistoryEmpty(wallHistory)) {
      const currGeneratorAlgoId = get().mazeGenerationAlgorithmId;

      const mazeGenerator = algoRegistry.findAlgoById(currGeneratorAlgoId);

      serialGenerator = mapGenerator(mazeGenerator(rows, cols, 10), (pair) => [
        pair[0].id,
        pair[1].id,
      ]);

      set({ serialGenerator, isMazeGenerationDone: false });
    }

    set({
      wallHistory: saveHistoryChanges(wallHistory, [...serialGenerator!]),
      isMazeGenerationDone: true,
    });
  },
});
