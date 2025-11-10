import { MazeMode } from "@models/algorithm-registry";
import { useMazeStore } from "@stores";
import { useMazeMode } from "@stores/selectors";

import { LegendSample, legendSampleConfigs } from "./legend-sample-configs";

export function useSymbolSamples(): readonly LegendSample[] {
  const mazeMode = useMazeMode();

  const currentAlgorithmId = useMazeStore((state) =>
    mazeMode === MazeMode.generation
      ? state.mazeGenerationAlgorithmId
      : state.mazeSolverId,
  );

  const displayMode = useMazeStore((state) => state.displayMode);

  const matchingConfig = legendSampleConfigs.find(
    (config) =>
      config.algorithmId === currentAlgorithmId &&
      (!displayMode || config.displayMode === displayMode),
  );

  return matchingConfig?.samples ?? [];
}
