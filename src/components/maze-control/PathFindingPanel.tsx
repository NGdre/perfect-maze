import { searchParams } from "@constants";
import { useSyncUrlParam } from "@hooks/useSyncUrlParam";
import { mazeSolversNames } from "@models/algorithm-registry";
import { useMazeStore } from "@stores";
import { useTakeStepInSolution } from "@stores/selectors";

import MazeControlsHeading from "../lib/typography/MazeControlsHeading";
import { AlgorithmChoiceChips } from "./AlgorithmChoiceChips";
import DisplayModes from "./DisplayModes";
import { StartOrEndChoiceChips } from "./StartOrEndChoiceChips";
import VisualizationControls from "./VisualizationControls";

const headingForPathFinders = "Алгоритмы";

export function PathFindingPanel() {
  const setMazeSolverId = useMazeStore((state) => state.setMazeSolverId);
  const takeStepInSolution = useTakeStepInSolution();
  const resetSolution = useMazeStore((state) => state.resetSolution);
  const solveMaze = useMazeStore((state) => state.solveMaze);

  const { updateParamInUrl: updateParams, currentParamValue: paramValue } =
    useSyncUrlParam(searchParams.MAZE_SOLVER, setMazeSolverId);

  return (
    <>
      <VisualizationControls
        onStep={takeStepInSolution}
        onReset={resetSolution}
        onComplete={solveMaze}
        resetTooltipContent="сбросить путь"
        completeTooltipContent="найти путь"
      />

      <StartOrEndChoiceChips />

      <MazeControlsHeading>{headingForPathFinders}</MazeControlsHeading>

      <AlgorithmChoiceChips
        algorithmNames={mazeSolversNames}
        onAlgorithmChange={updateParams}
        selectedAlgorithm={paramValue}
      />

      <DisplayModes />
    </>
  );
}
