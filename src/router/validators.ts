import { searchParams } from "@constants";
import {
  algoRegistry,
  generatorNames,
  mazeSolversNames,
} from "@models/algorithm-registry";
import { clamp } from "@utils";
import {
  ParamValidationInput,
  validateUrlParam,
} from "src/validation/validateUrlParam";

import { deleteSearchParam, setSearchParam } from "./utils";

export const ensureValidMazeGeneratorParam = (
  mazeGenerator: ParamValidationInput,
  url: URL,
) => {
  const generatorValidation = validateUrlParam(mazeGenerator, generatorNames);

  if (!generatorValidation.isValid)
    setSearchParam(url, searchParams.MAZE_GENERATOR, generatorValidation.value);

  return generatorValidation.value;
};

export const ensureValidMazeSolverParam = (
  mazeSolver: ParamValidationInput,
  url: URL,
) => {
  const solverValidation = validateUrlParam(mazeSolver, mazeSolversNames);

  if (!solverValidation.isValid)
    setSearchParam(url, searchParams.MAZE_SOLVER, solverValidation.value);

  return solverValidation.value;
};

export const ensureValidDisplayModeParam = (
  displayMode: ParamValidationInput,
  url: URL,
  mazeSolverValue: string,
) => {
  const mazeSolverId = algoRegistry.getIdByName(mazeSolverValue);
  const displayModes = algoRegistry.getDisplayModes(mazeSolverId);
  const hasDisplayModes = displayModes.length > 0;

  const displayModeValidation = validateUrlParam(displayMode, displayModes);

  if (hasDisplayModes) {
    if (!displayModeValidation.isValid)
      setSearchParam(
        url,
        searchParams.DISPLAY_MODE,
        displayModeValidation.value,
      );
  } else if (displayMode.param !== null) {
    deleteSearchParam(url, searchParams.DISPLAY_MODE);
  }

  return displayModeValidation.value;
};

export const ensureValidPositiveNumberParam = (
  paramName: string,
  searchParam: string | null,
  min: number,
  max: number,
  defaultValue: number,
  url: URL,
) => {
  let isValid = true;

  let maybePositive = parseInt(searchParam ?? "");

  if (Number.isNaN(maybePositive)) {
    maybePositive = defaultValue;
    isValid = false;
  }

  if (maybePositive < 0) {
    maybePositive *= -1;
    isValid = false;
  }

  if (maybePositive < min || max < maybePositive) {
    maybePositive = clamp(maybePositive, min, max);
    isValid = false;
  }

  if (!isValid) setSearchParam(url, paramName, String(maybePositive));
};
