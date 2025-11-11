import { useMazeStore } from "@stores";
import { useCurrentAlgoId } from "src/hooks/useCurrentAlgoId";

import { LegendSample, legendSampleConfigs } from "./legend-sample-configs";

export function useSymbolSamples(): readonly LegendSample[] {
  const currentAlgorithmId = useCurrentAlgoId();

  const displayMode = useMazeStore((state) => state.displayMode);

  const matchingConfig = legendSampleConfigs.find(
    (config) =>
      config.algorithmId === currentAlgorithmId &&
      (!displayMode || config.displayMode === displayMode),
  );

  return matchingConfig?.samples ?? [];
}
