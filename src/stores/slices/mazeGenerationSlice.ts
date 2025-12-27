import { MazeData, getDefaultMazeData } from "@models/maze";
import {
  WallHistorySnapshot,
  backwardHistory,
  clearHistory,
  createWallHistory,
  forwardHistory,
  saveHistoryChanges,
} from "@models/wall-history";
import { MainStore } from "@stores";
import { flatMap } from "@utils";
import { MazeGeneratorWorkerManager } from "@workers/maze-generator-worker-manager";
import { StateCreator } from "zustand";

import { TimeDirection } from "./mazeSolutionSlice";

type State = {
  mazeData: MazeData;
  wallHistory: WallHistorySnapshot;
  isMazeGenerationDone: boolean;
};

type Action = {
  initMaze: () => Promise<void>;
  generateMaze: () => Promise<void>;
  takeStepInGeneration: (direction: TimeDirection) => Promise<boolean>;
  resetMaze: () => Promise<void>;
};

export type MazeGenerationSlice = State & Action;

export const createMazeGenerationSlice: StateCreator<
  MainStore,
  [["zustand/immer", never]],
  [["zustand/immer", never]],
  MazeGenerationSlice
> = (set, get) => {
  let mazeGenerator: MazeGeneratorWorkerManager | null = null;

  const getMazeGenerator = async () => {
    if (mazeGenerator?.isReady) return mazeGenerator;

    if (!mazeGenerator) {
      mazeGenerator = new MazeGeneratorWorkerManager();
    }

    return mazeGenerator;
  };

  const initializeIfNeeded = async (generator: MazeGeneratorWorkerManager) => {
    if (await generator.isMazeGeneratorInitialized()) return;

    const { columnsAmount, rowsAmount, mazeGenerationAlgorithmId } = get();
    await generator.initMazeGenerator({
      cols: columnsAmount,
      rows: rowsAmount,
      mazeGeneratorAlgoId: mazeGenerationAlgorithmId,
    });
  };

  return {
    wallHistory: createWallHistory(),
    isMazeGenerationDone: false,
    mazeData: getDefaultMazeData(),

    async initMaze() {
      const rows = get().rowsAmount;
      const cols = get().columnsAmount;

      try {
        const generator = await getMazeGenerator();

        const mazeData = await generator.createMazeGrid(rows, cols);

        set({ mazeData });
      } catch (error) {
        console.error("Error in initMaze:", error);
        throw error;
      }
    },

    async resetMaze() {
      const isMazeInitialized = get().mazeData.cellIds.length !== 0;

      if (!isMazeInitialized) return;

      try {
        const generator = await getMazeGenerator();
        await generator.reset();

        set({
          wallHistory: clearHistory(),
          isMazeGenerationDone: false,
        });
      } catch (error) {
        console.error("Error in resetMaze:", error);
        throw error;
      }
    },

    // return true if serialGenerator is done, otherwise false
    takeStepInGeneration: async (direction: TimeDirection) => {
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

      if (get().isMazeGenerationDone) return false;

      try {
        const generator = await getMazeGenerator();

        await initializeIfNeeded(generator);

        const next = await generator.takeStep();

        if (next) {
          if (next.done) {
            set({ isMazeGenerationDone: true });
          } else {
            if (next.value) {
              set({
                wallHistory: saveHistoryChanges(
                  wallHistory,
                  next.value.wallsToRemove,
                ),
              });
            }
          }

          return !next.done;
        }
      } catch (error) {
        console.error("Error in generateMaze:", error);
        throw error;
      }

      return false;
    },

    async generateMaze() {
      const { wallHistory } = get();

      try {
        const generator = await getMazeGenerator();

        await initializeIfNeeded(generator);

        const wallChanges = await generator.generateMaze();

        if (wallChanges) {
          set({
            wallHistory: saveHistoryChanges(
              wallHistory,
              flatMap(wallChanges, (genResult) => genResult.wallsToRemove),
            ),
            isMazeGenerationDone: true,
          });
        }
      } catch (error) {
        console.error("Error in generateMaze:", error);
        throw error;
      }
    },
  };
};
