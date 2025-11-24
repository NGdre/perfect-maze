import { CellPatch } from "@models/CellHistory";
import { algoRegistry } from "@models/algorithm-registry";
import {
  MazeData,
  WallsToRemove,
  createCellFinder,
  mapPairsToNeighbors,
  removeWalls,
} from "@models/maze";
import { SerialSolver } from "@stores/slices/mazeSolutionSlice";
import * as Comlink from "comlink";

export interface MazeSolverWorker {
  serialSolver: SerialSolver;

  init({
    startId,
    endId,
    mazeSolverId,
    mazeData,
    wallsToRemove,
  }: {
    startId: string;
    endId: string;
    mazeSolverId: number;
    mazeData: MazeData;
    wallsToRemove: WallsToRemove;
  }): void;

  solveMaze(): CellPatch[][] | undefined;
  takeStep(): IteratorResult<CellPatch[], void> | undefined;
}

const api: MazeSolverWorker = {
  serialSolver: null,

  init({ mazeData, mazeSolverId, startId, endId, wallsToRemove }) {
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

  solveMaze() {
    if (this.serialSolver) {
      return [...this.serialSolver];
    }
  },

  takeStep() {
    return this.serialSolver?.next();
  },
};

Comlink.expose(api);
