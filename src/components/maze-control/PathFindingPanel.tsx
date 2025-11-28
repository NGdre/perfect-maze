import { mazeSolversNames } from "@models/algorithm-registry";
import { useMazeStore } from "@stores";
import { useTakeStepInSolution } from "@stores/selectors";
import MazeControlsHeading from "../lib/typography/MazeControlsHeading";
import { AlgorithmChoiceChips } from "./AlgorithmChoiceChips";
import { StartOrEndChoiceChips } from "./StartOrEndChoiceChips";
import VisualizationControls from "./VisualizationControls";

const headingForPathFinders = "Алгоритмы";

export function PathFindingPanel() {
  const setMazeSolverId = useMazeStore((state) => state.setMazeSolverId);
  const takeStepInSolution = useTakeStepInSolution();
  const resetSolution = useMazeStore((state) => state.resetSolution);
  const solveMaze = useMazeStore((state) => state.solveMaze);

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
        updateAlgorithm={(algo) => setMazeSolverId(algo)}
      />
    </>
  );
}
