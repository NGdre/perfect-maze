import { kruskal } from "./generators/kruskal";
import { recursiveBacktracking } from "./generators/recursive-backtracking";
import { aStarSerialVisual } from "./solvers/a-star";
import { bfsSerialVisual } from "./solvers/breadth-first-search";

export const MazeMode = {
  generation: "generation",
  solving: "solving",
} as const;

export type MazeModeType = (typeof MazeMode)[keyof typeof MazeMode];

type AlgoConfig = Readonly<{
  id: number;
  name: string;
  type: MazeModeType;
  func: (...args: any[]) => Generator<any>;
}>;

export class AlgorithmRegistry {
  private lastAlgoId = -1;
  private algoList: AlgoConfig[] = [];

  push(config: Omit<AlgoConfig, "id">) {
    this.lastAlgoId++;

    this.algoList.push({ ...config, id: this.lastAlgoId });

    return this.lastAlgoId;
  }

  findConfigById(id: AlgoConfig["id"]) {
    const found = this.algoList[id];

    if (!found) throw new Error("there's no algorithm config with id " + id);

    return found;
  }

  findAlgoById(id: AlgoConfig["id"]) {
    return this.findConfigById(id).func;
  }

  getName(id: AlgoConfig["id"]) {
    return this.findConfigById(id).name;
  }

  getIdByName(name: AlgoConfig["name"]) {
    const found = this.algoList.find((config) => config.name === name);

    if (!found) throw new Error("there's no algorithm with name " + name);

    return found.id;
  }

  getGroup(type: AlgoConfig["type"]) {
    return this.algoList
      .filter((config) => config.type === type)
      .map((config) => config.id);
  }

  hasAlgorithm(id: number): boolean {
    return (
      id >= 0 && id < this.algoList.length && this.algoList[id] !== undefined
    );
  }
}

export const algoRegistry = new AlgorithmRegistry();

export const KRUSKAL_ID = algoRegistry.push({
  name: "kruskal",
  type: MazeMode.generation,
  func: kruskal,
});

export const RECURSIVE_BACKTRACKING_ID = algoRegistry.push({
  name: "recursive backtracking",
  type: MazeMode.generation,
  func: recursiveBacktracking,
});

export const A_STAR_ID = algoRegistry.push({
  name: "A*",
  type: MazeMode.solving,
  func: aStarSerialVisual,
});

export const BFS_ID = algoRegistry.push({
  name: "breadth first search",
  type: MazeMode.solving,
  func: bfsSerialVisual,
});

export const generatorNames = algoRegistry
  .getGroup(MazeMode.generation)
  .map((id) => algoRegistry.getName(id));

export const mazeSolversNames = algoRegistry
  .getGroup(MazeMode.solving)
  .map((id) => algoRegistry.getName(id));
