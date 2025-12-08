import { searchParams } from "@constants";
import { useSyncUrlParam } from "@hooks/useSyncUrlParam";
import { generatorNames } from "@models/algorithm-registry";
import { useMazeStore } from "@stores";

import MazeControlsHeading from "../lib/typography/MazeControlsHeading";
import { AlgorithmChoiceChips } from "./AlgorithmChoiceChips";
import ResizeForm from "./ResizeForm";
import VisualizationControls from "./VisualizationControls";

const headingForGenerators = "Алгоритмы";

export function MazeGenerationPanel() {
  const updateMazeGenerator = useMazeStore(
    (state) => state.updateMazeGenerationAlgorithm,
  );

  const takeStepInGeneration = useMazeStore(
    (state) => state.takeStepInGeneration,
  );

  const resetMaze = useMazeStore((state) => state.resetMaze);
  const generateMaze = useMazeStore((state) => state.generateMaze);

  const { updateParamInUrl: updateParams, currentParamValue: paramValue } =
    useSyncUrlParam(searchParams.MAZE_GENERATOR, updateMazeGenerator);

  return (
    <>
      <VisualizationControls
        onStep={takeStepInGeneration}
        onReset={resetMaze}
        onComplete={generateMaze}
        resetTooltipContent="сбросить лабиринт"
        completeTooltipContent="сгенерировать лабиринт"
      />
      <ResizeForm />
      <MazeControlsHeading>{headingForGenerators}</MazeControlsHeading>
      <AlgorithmChoiceChips
        algorithmNames={generatorNames}
        onAlgorithmChange={updateParams}
        selectedAlgorithm={paramValue}
      />
    </>
  );
}
