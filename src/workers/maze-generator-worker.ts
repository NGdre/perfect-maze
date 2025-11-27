import { MazeGenerator, algoRegistry } from "@models/algorithm-registry";
import { MazeData, createMaze } from "@models/maze";
import { HistoryChange } from "@models/wall-history";
import { mapGenerator } from "@utils";
import * as Comlink from "comlink";

export interface MazeGeneratorInitData {
  rows: number;
  cols: number;
  mazeGeneratorAlgoId: number;
  seed?: number;
}

export interface MazeGeneratorWorker {
  mazeGenerator: MazeGenerator | null;
  initMazeGenerator(initData: MazeGeneratorInitData): void;
  createMazeGrid(rows: number, cols: number): MazeData;
  generateMaze(): HistoryChange[] | void;
  takeStep(): IteratorResult<HistoryChange, void> | undefined;
  isMazeGeneratorExist(): boolean;
  resetMazeGenerator(): void;
}

export const INIT_MAZE_GENERATOR_WORKER_METHOD = "initMazeGenerator";
export const CREATE_GRID_WORKER_METHOD = "createMazeGrid";
export const GENERATE_MAZE_WORKER_METHOD = "generateMaze";
export const TAKE_STEP_WORKER_METHOD = "takeStep";
export const IS_MAZE_GENERATOR_EXIST_WORKER_METHOD = "isMazeGeneratorExist";
export const RESET_MAZE_GENERATOR_WORKER_METHOD = "resetMazeGenerator";

const api: MazeGeneratorWorker = {
  mazeGenerator: null,

  [INIT_MAZE_GENERATOR_WORKER_METHOD]({
    cols,
    rows,
    mazeGeneratorAlgoId,
    seed,
  }) {
    const mazeGenerator = algoRegistry.findAlgoById(mazeGeneratorAlgoId);

    this.mazeGenerator = mapGenerator(
      mazeGenerator(rows, cols, seed),
      (pair) => [pair[0].id, pair[1].id],
    );
  },

  [CREATE_GRID_WORKER_METHOD](rows, cols) {
    return createMaze(rows, cols);
  },

  [GENERATE_MAZE_WORKER_METHOD]() {
    if (this.mazeGenerator) {
      const result = [...this.mazeGenerator];

      return result;
    }
  },

  [TAKE_STEP_WORKER_METHOD]() {
    return this.mazeGenerator?.next();
  },

  [IS_MAZE_GENERATOR_EXIST_WORKER_METHOD]() {
    return this.mazeGenerator !== null;
  },

  [RESET_MAZE_GENERATOR_WORKER_METHOD]() {
    this.mazeGenerator = null;
  },
};

Comlink.expose(api);
