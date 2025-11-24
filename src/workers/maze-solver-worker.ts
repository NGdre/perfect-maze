import { CellPatch } from "@models/CellHistory";
import { algoRegistry } from "@models/algorithm-registry";
import {
  MazeData,
  WallsToRemove,
  createCellFinder,
  mapPairsToNeighbors,
  removeWalls,
} from "@models/maze";
import * as Comlink from "comlink";

export type SerialSolver = Generator<CellPatch[], void, any> | null;

export interface MazeSolverInitData {
  startId: string;
  endId: string;
  mazeSolverId: number;
  mazeData: MazeData;
  wallsToRemove: WallsToRemove;
}

export type SolveMazeResult = CellPatch[][] | void;
export type TakeStepResult = IteratorResult<CellPatch[], void> | undefined;

export interface MazeSolverWorker {
  serialSolver: SerialSolver;

  initSerialSolver({
    startId,
    endId,
    mazeSolverId,
    mazeData,
    wallsToRemove,
  }: MazeSolverInitData): void;

  solveMaze(): SolveMazeResult;
  takeStep(): TakeStepResult;
}

export const INIT_SERIAL_SOLVER_WORKER_METHOD = "initSerialSolver";
export const SOLVE_MAZE_WORKER_METHOD = "solveMaze";
export const TAKE_STEP_WORKER_METHOD = "takeStep";

const api: MazeSolverWorker = {
  serialSolver: null,

  [INIT_SERIAL_SOLVER_WORKER_METHOD]({
    mazeData,
    mazeSolverId,
    startId,
    endId,
    wallsToRemove,
  }) {
    const mazeSolver = algoRegistry.findAlgoById(mazeSolverId);

    if (!mazeSolver || mazeData.cellIds.length === 0) return null;

    removeWalls(mazeData, wallsToRemove);

    const cellFinder = createCellFinder(
      mazeData,
      mapPairsToNeighbors(mazeData, wallsToRemove),
    );

    this.serialSolver = mazeSolver(startId, endId, {
      get(id: string) {
        return cellFinder(id);
      },
    });
  },

  [SOLVE_MAZE_WORKER_METHOD]() {
    if (this.serialSolver) {
      return [...this.serialSolver];
    }
  },

  [TAKE_STEP_WORKER_METHOD]() {
    return this.serialSolver?.next();
  },
};

Comlink.expose(api);
