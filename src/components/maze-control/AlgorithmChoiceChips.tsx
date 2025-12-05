import { useMazeStore } from "@stores";

import { ChoiceChips } from "../lib/choice-chips/ChoiceChips";

export function AlgorithmChoiceChips<T extends string>({
  algorithmNames,
  selectedAlgorithm,
  onAlgorithmChange,
}: {
  algorithmNames: T[];
  selectedAlgorithm: T;
  onAlgorithmChange: (algorithm: T) => void;
  disabled?: boolean;
}) {
  const isMazeRendering = useMazeStore((state) => state.isMazeRendering);

  return (
    <ChoiceChips
      options={algorithmNames.map((algorithm) => ({
        value: algorithm,
        label: algorithm,
        disabled: isMazeRendering,
      }))}
      initialValue={selectedAlgorithm}
      onChange={(algorithm) => algorithm && onAlgorithmChange(algorithm)}
      className="!mb-5"
    />
  );
}
