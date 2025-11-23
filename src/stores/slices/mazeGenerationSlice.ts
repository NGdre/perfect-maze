import { algoRegistry } from "@models/algorithm-registry";
import {
  MazeData,
  createMaze,
  generateRectMazeId,
  getDefaultMazeData,
} from "@models/maze";
import {
  WallHistorySnapshot,
  backwardHistory,
  clearHistory,
  createWallHistory,
  forwardHistory,
  isHistoryEmpty,
  saveHistoryChange,
  saveHistoryChanges,
} from "@models/wall-history";
import { MainStore } from "@stores";
import { mapGenerator } from "@utils";
import { StateCreator } from "zustand";

import { TimeDirection } from "./mazeSolutionSlice";

type State = {
  mazeData: MazeData;
  serialGenerator: Generator<any, void, any> | null;
  wallHistory: WallHistorySnapshot;
  isMazeGenerationDone: boolean;
};

type Action = {
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
  serialGenerator: null,
  wallHistory: createWallHistory(),
  isMazeGenerationDone: false,
  mazeData: getDefaultMazeData(),

  initMaze() {
    const rows = get().rowsAmount;
    const cols = get().columnsAmount;

    set({
      endId: generateRectMazeId(rows - 1, cols - 1),
    });

    const mazeData = createMaze(rows, cols);

    set({ mazeData });
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

    if (serialGenerator) {
      const next = serialGenerator.next();

      if (next.done) {
        set({ isMazeGenerationDone: true });
      } else {
        set({ wallHistory: saveHistoryChange(wallHistory, next.value) });
      }

      return !next.done;
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
