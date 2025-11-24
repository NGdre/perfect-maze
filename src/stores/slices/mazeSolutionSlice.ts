import { INITIAL_MAX_PATH_DISTANCE } from "@constants";
import { type CellPatch } from "@models/CellHistory";
import { type PolygonCell } from "@models/maze";
import { MainStore } from "@stores/index";
import { MazeSolverWorker } from "@workers/maze-solver-worker";
import * as Comlink from "comlink";
import { StateCreator } from "zustand";

export type SerialSolver = Generator<CellPatch[], void, any> | null;
export type TimeDirection = "backward" | "forward";

type State = {
  mazeSolution: Array<PolygonCell>;
  currVisualMazeChange: CellPatch[] | null;
  mazeSolutionWorker: Worker | null;
  workerProxy: Comlink.Remote<MazeSolverWorker> | null;
  isSerialSolverDone: boolean;
  isUndoOperation: boolean;
  maxPathDistance: number;
  isInitializing: boolean;
};

type Action = {
  solveMaze: () => void;
  takeStepInSolution: (direction: TimeDirection) => Promise<boolean>;
  setMaxPathDistance: (max: State["maxPathDistance"]) => void;
  resetSolution: () => void;
};

export type MazeSolutionSlice = State & Action;

export const createMazeSolutionSlice: StateCreator<
  MainStore,
  [["zustand/immer", never]],
  [["zustand/immer", never]],
  MazeSolutionSlice
> = (set, get) => {
  async function initSerialSolver() {
    // Проверяем, не инициализируем ли мы уже воркер
    if (get().isInitializing || get().mazeSolutionWorker) {
      return;
    }

    set({ isInitializing: true });

    try {
      const {
        startId,
        endId,
        mazeSolverId,
        mazeData,
        wallHistory: { history: wallsToRemove },
      } = get();

      const worker = new Worker(
        new URL("../../workers/maze-solver-worker", import.meta.url),
        { type: "module" },
      );

      const workerProxy = Comlink.wrap<MazeSolverWorker>(worker);

      await workerProxy.init({
        startId,
        endId,
        mazeSolverId,
        mazeData,
        wallsToRemove,
      });

      set({
        mazeSolutionWorker: worker,
        workerProxy,
        isInitializing: false,
      });
    } catch (error) {
      set({ isInitializing: false });
      console.error("Failed to initialize worker:", error);
      throw error;
    }
  }

  return {
    workerProxy: null,
    mazeSolution: [],
    isSerialSolverDone: false,
    isUndoOperation: false,
    maxPathDistance: INITIAL_MAX_PATH_DISTANCE,
    currVisualMazeChange: null,
    isInitializing: false,
    mazeSolutionWorker: null,

    resetSolution: () => {
      const { mazeSolutionWorker } = get();

      mazeSolutionWorker?.terminate();

      get().cellHistory.clear();
      set({
        mazeSolutionWorker: null,
        workerProxy: null,
        currVisualMazeChange: null,
        mazeSolution: [],
        isSerialSolverDone: false,
        isInitializing: false,
      });
    },

    async solveMaze() {
      try {
        const cellHistory = get().cellHistory;

        if (!get().mazeSolutionWorker) {
          await initSerialSolver();
        }

        const workerProxy = get().workerProxy;
        if (!workerProxy) {
          throw new Error("Worker proxy not available");
        }

        const patches = await workerProxy.solveMaze();

        if (patches) {
          cellHistory.applyMultipleSteps(patches);

          set({
            currVisualMazeChange: cellHistory.historyCurrentStep.forward,
            isSerialSolverDone: true,
          });
        }
      } catch (error) {
        console.error("Error in solveMaze:", error);
        throw error;
      }
    },

    async takeStepInSolution(direction) {
      const cellHistory = get().cellHistory;

      if (direction === "backward") {
        if (cellHistory.canUndo()) {
          set({
            currVisualMazeChange: cellHistory.historyCurrentStep.backward,
            isUndoOperation: true,
          });
          cellHistory.undo();
        }
        return true;
      }

      set({ isUndoOperation: false });

      if (cellHistory.canRedo()) {
        cellHistory.redo();
        set({
          currVisualMazeChange: cellHistory.historyCurrentStep.forward,
        });
        return true;
      }

      if (get().isSerialSolverDone) {
        return false;
      }

      try {
        if (!get().mazeSolutionWorker && !get().isInitializing) {
          await initSerialSolver();
        }

        const worker = get().mazeSolutionWorker;
        const workerProxy = get().workerProxy;

        if (worker && workerProxy) {
          const next = await workerProxy.takeStep();

          if (next) {
            if (next.done) {
              worker.terminate();
              set({
                workerProxy: null,
                mazeSolutionWorker: null,
                isSerialSolverDone: true,
              });
            } else {
              cellHistory.applyStep(next.value);
              set({
                currVisualMazeChange: next.value,
              });
            }
            return !next.done;
          }
        }
      } catch (error) {
        console.error("Error in takeStepInSolution:", error);
        get().resetSolution();
      }

      return false;
    },

    setMaxPathDistance(maxPathDistance) {
      set({ maxPathDistance });
    },
  };
};
