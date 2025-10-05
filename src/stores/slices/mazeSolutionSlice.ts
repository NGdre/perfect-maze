import { StateCreator } from "zustand";
import {
  createIdToCellMap,
  fillCellsWithOpenNeighbors,
  generateRectMazeId,
  RectMaze,
  removeWallsBetweenCells,
  type PolygonCell,
} from "@models/maze";
import { type CellPatch } from "@models/CellHistory";
import { getFunctionById } from "@solvers/index";
import { MainStore } from "@stores/index";
import { WallHistoryState } from "src/models/wall-history";
import { cloneDeep } from "lodash";

function initSerialSolver(
  startId: string,
  endId: string,
  mazeSolverId: number,
  mazeInstance: RectMaze | null,
  wallsToRemove: WallHistoryState
) {
  const mazeSolver = getFunctionById(mazeSolverId, "SteppedAlgoExecution");

  const maze = mazeInstance;

  if (!mazeSolver || !maze) return false;

  const cells = cloneDeep(maze.cells);

  removeWallsBetweenCells(cells, wallsToRemove);
  fillCellsWithOpenNeighbors(cells);

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
};

type Action = {
  solveMaze: () => void;
  takeStepInSolution: (direction: TimeDirection) => boolean;
  resetSolution: () => void;
  setCellSelection: (cellSelection: State["cellSelection"]) => void;
  setStartId: (startId: State["startId"]) => void;
  setEndId: (endId: State["endId"]) => void;
  setMazeSolverId: (mazeSolverId: State["mazeSolverId"]) => void;
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
  mazeSolverId: 0,
  isSerialSolverDone: false,

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

  setMazeSolverId: (mazeSolverId) => {
    get().resetSolution();

    set({
      mazeSolverId,
    });
  },

  resetSolution: () => {
    get().cellHistory.clear();
    set({
      serialSolver: null,
      currVisualMazeChange: null,
      mazeSolution: [],
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
        get().wallHistory.history
      );
      set({ serialSolver });
    }
    cellHistory.applyMultipleSteps([...serialSolver!]);

    set({
      currVisualMazeChange: cellHistory.historyCurrentStep.forward,
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
        });

        cellHistory.undo();
      }

      return true;
    }

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
        get().wallHistory.history
      );

      set({ serialSolver });
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
});
