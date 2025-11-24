import { INITIAL_MAX_PATH_DISTANCE } from "@constants";
import { type CellPatch } from "@models/CellHistory";
import { type PolygonCell } from "@models/maze";
import { MainStore } from "@stores";
import { MazeSolverWorkerManager } from "@workers/maze-solver-worker-manager";
import { StateCreator } from "zustand";

export type TimeDirection = "backward" | "forward";

type State = {
  mazeSolution: Array<PolygonCell>;
  currVisualMazeChange: CellPatch[] | null;
  isSerialSolverDone: boolean;
  isUndoOperation: boolean;
  maxPathDistance: number;
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
  let mazeSolver: MazeSolverWorkerManager | null = null;

  const getSolver = async (): Promise<MazeSolverWorkerManager> => {
    if (mazeSolver?.isReady) return mazeSolver;

    if (!mazeSolver) {
      mazeSolver = new MazeSolverWorkerManager();
    }

    const { startId, endId, mazeSolverId, mazeData, wallHistory } = get();

    await mazeSolver.init({
      startId,
      endId,
      mazeSolverId,
      mazeData,
      wallsToRemove: wallHistory.history,
    });

    return mazeSolver;
  };

  return {
    mazeSolution: [],
    isSerialSolverDone: false,
    isUndoOperation: false,
    maxPathDistance: INITIAL_MAX_PATH_DISTANCE,
    currVisualMazeChange: null,

    resetSolution: () => {
      mazeSolver?.terminate();
      mazeSolver = null;

      get().cellHistory.clear();
      set({
        currVisualMazeChange: null,
        mazeSolution: [],
        isSerialSolverDone: false,
      });
    },

    async solveMaze() {
      try {
        const cellHistory = get().cellHistory;

        const solver = await getSolver();
        const patches = await solver.solveMaze();

        if (patches) {
          cellHistory.applyMultipleSteps(patches);

          set({
            currVisualMazeChange: cellHistory.historyCurrentStep.forward,
            isSerialSolverDone: true,
          });
        }
      } catch (error) {
        console.error("Error in solveMaze:", error);
        get().resetSolution();
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
        const solver = await getSolver();

        if (solver) {
          const next = await solver.takeStep();

          if (next) {
            if (next.done) {
              mazeSolver?.terminate();
              mazeSolver = null;

              set({
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
        return false;
      }

      return false;
    },

    setMaxPathDistance(maxPathDistance) {
      set({ maxPathDistance });
    },
  };
};
