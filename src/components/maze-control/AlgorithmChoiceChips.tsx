import { useMazeStore } from "@stores";
import { ChoiceChips } from "../lib/choice-chips/ChoiceChips";

export function AlgorithmChoiceChips<T extends string>({
  algorithmNames,
  updateAlgorithm,
}: {
  algorithmNames: T[];
  updateAlgorithm: (algorithm: T) => void;
}) {
  const isMazeRendering = useMazeStore((state) => state.isMazeRendering);

  return (
    <ChoiceChips
      options={algorithmNames.map((label, i) => ({
        value: String(i),
        label,
        disabled: isMazeRendering,
      }))}
      onChange={(index) => index && updateAlgorithm(algorithmNames[+index])}
      className="!mb-5"
    />
  );
}
