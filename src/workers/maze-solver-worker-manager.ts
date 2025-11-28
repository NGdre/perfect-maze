import { BaseWorkerManager } from "@models/base-worker-manager";

import {
  INIT_SERIAL_SOLVER_WORKER_METHOD,
  MazeSolverInitData,
  MazeSolverWorker as MazeSolverWorkerI,
  SOLVE_MAZE_WORKER_METHOD,
  SolveMazeResult,
  TAKE_STEP_WORKER_METHOD,
  TakeStepResult,
} from "./maze-solver-worker";
import MazeSolverWorker from "./maze-solver-worker.ts?worker";

export class MazeSolverWorkerManager extends BaseWorkerManager<MazeSolverWorkerI> {
  protected getWorker(): Worker {
    return new MazeSolverWorker();
  }

  async init(initData: MazeSolverInitData): Promise<void> {
    await super.initWorker();

    await this.callWorkerMethod(INIT_SERIAL_SOLVER_WORKER_METHOD, initData);
  }

  async solveMaze(): Promise<SolveMazeResult> {
    return this.callWorkerMethod(SOLVE_MAZE_WORKER_METHOD);
  }

  async takeStep(): Promise<TakeStepResult> {
    return this.callWorkerMethod(TAKE_STEP_WORKER_METHOD);
  }
}
