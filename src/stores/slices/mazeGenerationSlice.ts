import { StateCreator } from "zustand";
import { createRectMaze, generateRectMazeId, RectMaze } from "@models/maze";
import { MainStore } from "@stores/index";
import { generatorNames, getGeneratorByAlgoName } from "@generators/index";
import { DEFAULT_COLUMNS_AMOUNT, DEFAULT_ROWS_AMOUNT } from "@constants";
import { TimeDirection } from "./mazeSolutionSlice";
import { mapGenerator } from "src/utils";
import {
  backwardHistory,
  clearHistory,
  createWallHistory,
  forwardHistory,
  isHistoryEmpty,
  saveHistoryChange,
  saveHistoryChanges,
  WallHistorySnapshot,
} from "src/models/wall-history";

type State = {
  mazeInstance: RectMaze | null;
  mazeGenerationAlgorithm: string;
  rowsAmount: RectMaze["rows"];
  columnsAmount: RectMaze["cols"];
  serialGenerator: Generator<any, void, any> | null;
  wallHistory: WallHistorySnapshot;
};

type Action = {
  updateRowsAmount: (newRowsAmount: State["rowsAmount"]) => void;
  updateColumnsAmount: (newColumnsAmount: State["columnsAmount"]) => void;

  updateMazeGenerationAlgorithm: (
    newAlgorithm: State["mazeGenerationAlgorithm"]
  ) => void;

  initMaze: (edgeLength: number) => void;
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
  mazeGenerationAlgorithm: generatorNames[0],
  mazeInstance: null,
  serialGenerator: null,
  wallHistory: createWallHistory(),

  updateRowsAmount: (newRowsAmount) => set({ rowsAmount: newRowsAmount }),

  updateColumnsAmount: (newColumnsAmount) =>
    set({ columnsAmount: newColumnsAmount }),

  updateMazeGenerationAlgorithm: (newAlgorithm) =>
    set({
      mazeGenerationAlgorithm: newAlgorithm,
      wallHistory: clearHistory(),
      serialGenerator: null,
    }),

  initMaze(edgeLength) {
    const rows = get().rowsAmount;
    const cols = get().columnsAmount;

    set({
      endId: generateRectMazeId(rows - 1, cols - 1),
    });

    const maze = createRectMaze(rows, cols, edgeLength);

    set({ mazeInstance: maze });
  },

  resetMaze() {
    set({ wallHistory: clearHistory() });
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
      const currGeneratorAlgo = get().mazeGenerationAlgorithm;

      const mazeGenerator = getGeneratorByAlgoName(currGeneratorAlgo);

      serialGenerator = mapGenerator(mazeGenerator(rows, cols), (pair) => [
        pair[0].id,
        pair[1].id,
      ]);

      set({ serialGenerator });
    }

    const next = serialGenerator?.next();

    if (next && next.done) {
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
      const currGeneratorAlgo = get().mazeGenerationAlgorithm;

      const mazeGenerator = getGeneratorByAlgoName(currGeneratorAlgo);

      serialGenerator = mapGenerator(mazeGenerator(rows, cols), (pair) => [
        pair[0].id,
        pair[1].id,
      ]);

      set({ serialGenerator });
    }

    set({
      wallHistory: saveHistoryChanges(wallHistory, [...serialGenerator!]),
    });
  },
});
