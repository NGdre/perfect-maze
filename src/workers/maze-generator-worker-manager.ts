import { BaseWorkerManager } from "@models/base-worker-manager";

import {
  CREATE_GRID_WORKER_METHOD,
  GENERATE_MAZE_WORKER_METHOD,
  INIT_MAZE_GENERATOR_WORKER_METHOD,
  IS_MAZE_GENERATOR_EXIST_WORKER_METHOD,
  MazeGeneratorInitData,
  MazeGeneratorWorker as MazeGeneratorWorkerI,
  RESET_MAZE_GENERATOR_WORKER_METHOD,
  TAKE_STEP_WORKER_METHOD,
} from "./maze-generator-worker";
import MazeGeneratorWorker from "./maze-generator-worker.ts?worker";

export class MazeGeneratorWorkerManager extends BaseWorkerManager<MazeGeneratorWorkerI> {
  protected getWorker(): Worker {
    return new MazeGeneratorWorker();
  }

  async initMazeGenerator(initData: MazeGeneratorInitData) {
    await this.callWorkerMethod(INIT_MAZE_GENERATOR_WORKER_METHOD, initData);
  }

  async createMazeGrid(rows: number, cols: number) {
    await super.initWorker();

    return await this.callWorkerMethod(CREATE_GRID_WORKER_METHOD, rows, cols);
  }

  async generateMaze() {
    return await this.callWorkerMethod(GENERATE_MAZE_WORKER_METHOD);
  }

  async takeStep() {
    return await this.callWorkerMethod(TAKE_STEP_WORKER_METHOD);
  }

  async isMazeGeneratorInitialized() {
    return await this.callWorkerMethod(IS_MAZE_GENERATOR_EXIST_WORKER_METHOD);
  }

  async reset() {
    return await this.callWorkerMethod(RESET_MAZE_GENERATOR_WORKER_METHOD);
  }
}
