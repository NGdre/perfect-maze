import { INITIAL_MAX_PATH_DISTANCE } from "@constants";
import { type CellPatch } from "@models/CellHistory";
import { algoRegistry } from "@models/algorithm-registry";
import {
  MazeData,
  type PolygonCell,
  WallsToRemove,
  createCellFinder,
  mapPairsToNeighbors,
  removeWallsPure,
} from "@models/maze";
import { MainStore } from "@stores/index";
import { StateCreator } from "zustand";

export type SerialSolver = Generator<CellPatch[], void, any> | null;

function initSerialSolver(
  startId: string,
  endId: string,
  mazeSolverId: number,
  mazeData: MazeData,
  wallsToRemove: WallsToRemove,
): SerialSolver {
  const mazeSolver = algoRegistry.findAlgoById(mazeSolverId);

  if (!mazeSolver || mazeData.cellIds.length === 0) return null;

  removeWallsPure(mazeData, wallsToRemove);

  const cellFinder = createCellFinder(
    mazeData,
    mapPairsToNeighbors(mazeData, wallsToRemove),
  );

  return mazeSolver(startId, endId, {
    get(id: string) {
      return cellFinder(id);
    },
  });
}

export type TimeDirection = "backward" | "forward";

type State = {
  mazeSolution: Array<PolygonCell>;
  currVisualMazeChange: CellPatch[] | null;
  serialSolver: Generator<[], void, any> | null;
  isSerialSolverDone: boolean;
  isUndoOperation: boolean;
  maxPathDistance: number;
};

type Action = {
  solveMaze: () => void;
  takeStepInSolution: (direction: TimeDirection) => boolean;
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
  return {
    serialSolver: null,
    mazeSolution: [],
    isSerialSolverDone: false,
    isUndoOperation: false,
    maxPathDistance: INITIAL_MAX_PATH_DISTANCE,
    currVisualMazeChange: null,

    resetSolution: () => {
      get().cellHistory.clear();
      set({
        serialSolver: null,
        currVisualMazeChange: null,
        mazeSolution: [],
        isSerialSolverDone: false,
      });
    },

    solveMaze() {
      const startId = get().startId;
      const endId = get().endId;
      const cellHistory = get().cellHistory;
      let { serialSolver } = get();

      if (serialSolver === null) {
        serialSolver = initSerialSolver(
          startId,
          endId,
          get().mazeSolverId,
          get().mazeData,
          get().wallHistory.history,
        );
        set({ serialSolver });
      }
      cellHistory.applyMultipleSteps([...serialSolver!]);

      set({
        currVisualMazeChange: cellHistory.historyCurrentStep.forward,
        isSerialSolverDone: true,
      });
    },

    takeStepInSolution(direction) {
      const startId = get().startId;
      const endId = get().endId;
      const cellHistory = get().cellHistory;

      // do not change the order of cellHistory.undo() and cellHistory.redo() with set function

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

      set({
        isUndoOperation: false,
      });

      if (cellHistory.canRedo()) {
        cellHistory.redo();

        set({
          currVisualMazeChange: cellHistory.historyCurrentStep.forward,
        });

        return true;
      }

      let serialSolver = get().serialSolver;

      if (cellHistory.isEmpty()) {
        serialSolver = initSerialSolver(
          startId,
          endId,
          get().mazeSolverId,
          get().mazeData,
          get().wallHistory.history,
        );

        set({ serialSolver, isSerialSolverDone: false });
      }

      const next = serialSolver?.next();

      if (next && next.done) {
        set({
          isSerialSolverDone: true,
        });
        return false;
      }

      if (next && !next.done) {
        cellHistory.applyStep(next.value);

        set({
          currVisualMazeChange: next.value,
        });

        return true;
      }

      return false;
    },

    setMaxPathDistance(maxPathDistance) {
      set({ maxPathDistance });
    },
  };
};
