import { MazeMode } from "src/models/algorithm-registry";
import { useMazeStore } from "src/stores";
import { useMazeMode } from "src/stores/selectors";

export function useCurrentAlgoId() {
  const mazeMode = useMazeMode();

  const currentAlgoId = useMazeStore((state) =>
    mazeMode === MazeMode.generation
      ? state.mazeGenerationAlgorithmId
      : state.mazeSolverId,
  );

  return currentAlgoId;
}
