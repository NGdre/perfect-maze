import { searchParams } from "@constants";
import {
  DEFAULT_DISPLAY_MODE,
  DEFAULT_MAZE_SOLVER_ID,
  algoRegistry,
} from "@models/algorithm-registry";
import { getState } from "@stores/index";

import {
  ensureValidDisplayModeParam,
  ensureValidMazeGeneratorParam,
  ensureValidMazeSolverParam,
} from "./validators";

export const mazeGenerationLoader = async ({
  request,
}: {
  request: Request;
}) => {
  const url = new URL(request.url);
  const params = url.searchParams;

  const mazeGenerator = {
    param: params.get(searchParams.MAZE_GENERATOR),
    fallback: algoRegistry.getName(getState().mazeGenerationAlgorithmId),
  };

  ensureValidMazeGeneratorParam(mazeGenerator, url);

  return params;
};

export const pathFindingLoader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const params = url.searchParams;

  const mazeSolver = {
    param: params.get(searchParams.MAZE_SOLVER),
    fallback: algoRegistry.getName(DEFAULT_MAZE_SOLVER_ID),
  };

  const mazeSolverValue = ensureValidMazeSolverParam(mazeSolver, url);

  const displayMode = {
    param: params.get(searchParams.DISPLAY_MODE),
    fallback: DEFAULT_DISPLAY_MODE,
  };

  ensureValidDisplayModeParam(displayMode, url, mazeSolverValue);

  return params;
};
