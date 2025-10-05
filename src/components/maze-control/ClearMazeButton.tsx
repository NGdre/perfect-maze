import { MazeMode, useMazeStore } from "@stores/index";

const ClearMazeButton = () => {
  const resetSolution = useMazeStore((state) => state.resetSolution);
  const resetMaze = useMazeStore((state) => state.resetMaze);

  const mazeMode = useMazeStore((state) => state.mazeMode);
  const isMazeRendering = useMazeStore((state) => state.isMazeRendering);
  return (
    <button
      onClick={() => {
        if (mazeMode === MazeMode.generation) {
          resetMaze();
        } else resetSolution();
      }}
      disabled={isMazeRendering}
    >
      Очистить
    </button>
  );
};

export default ClearMazeButton;
