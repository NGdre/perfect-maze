import { type CellPatch } from "@models/CellHistory";
import { MazeMode, algoRegistry } from "@models/algorithm-registry";
import {
  type PolygonCell,
  RectMaze,
  createIdToCellMap,
  generateRectMazeId,
  removeWallsBetweenCells,
} from "@models/maze";
import { WallHistoryState } from "@models/wall-history";
import { MainStore } from "@stores/index";
import { cloneDeep } from "lodash";
import { StateCreator } from "zustand";

function initSerialSolver(
  startId: string,
  endId: string,
  mazeSolverId: number,
  mazeInstance: RectMaze | null,
  wallsToRemove: WallHistoryState,
) {
  const mazeSolver = algoRegistry.findAlgoById(mazeSolverId);

  const maze = mazeInstance;

  if (!mazeSolver || !maze) return null;

  const cells = cloneDeep(maze.cells);

  removeWallsBetweenCells(cells, wallsToRemove);

  const map = createIdToCellMap(cells);

  return mazeSolver(startId, endId, map);
}

export type TimeDirection = "backward" | "forward";

export const cellSelectionModes = {
  none: "none",
  start: "start",
  end: "end",
};

export type CellSelectionModes = keyof typeof cellSelectionModes;

type State = {
  mazeSolution: Array<PolygonCell>;
  currVisualMazeChange: CellPatch[] | null;
  serialSolver: Generator<[], void, any> | null;
  startId: string;
  endId: string;
  cellSelection: CellSelectionModes;
  mazeSolverId: number;
  isSerialSolverDone: boolean;
  isUndoOperation: boolean;
  maxPathDistance: number;
};

type Action = {
  solveMaze: () => void;
  takeStepInSolution: (direction: TimeDirection) => boolean;
  resetSolution: () => void;
  setCellSelection: (cellSelection: State["cellSelection"]) => void;
  setStartId: (startId: State["startId"]) => void;
  setEndId: (endId: State["endId"]) => void;
  setMazeSolverId: (mazeSolverName: string) => void;
  setMaxPathDistance: (max: State["maxPathDistance"]) => void;
};

export type MazeSolutionSlice = State & Action;

export const createMazeSolutionSlice: StateCreator<
  MainStore,
  [["zustand/immer", never]],
  [["zustand/immer", never]],
  MazeSolutionSlice
> = (set, get) => ({
  serialSolver: null,
  mazeSolution: [],
  startId: generateRectMazeId(0, 0),
  endId: generateRectMazeId(0, 0),
  cellSelection: "none",
  mazeSolverId: algoRegistry.getGroup(MazeMode.solving)[0],
  isSerialSolverDone: false,
  isUndoOperation: false,
  maxPathDistance: 0,
  currVisualMazeChange: null,

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
    get().resetSolution();

    set({
      mazeSolverId: algoRegistry.getIdByName(mazeSolverName),
    });
  },

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
        get().mazeInstance,
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
        get().mazeInstance,
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
});
