import { useMazeStore } from "./maze-store";

export const useMazeCells = () =>
  useMazeStore((state) =>
    state.mazeData.cellIds.length > 0 ? state.mazeData.cellIds.length : null,
  );

export const useCurrVisualMazeChange = () =>
  useMazeStore((state) => state.currVisualMazeChange);

export const useCellHistory = () => useMazeStore((state) => state.cellHistory);

export const useIsCellHistoryEmpty = () =>
  useMazeStore((state) => state.cellHistory.isEmpty());

export const useStartId = () => useMazeStore((state) => state.startId);

export const useEndId = () => useMazeStore((state) => state.endId);

export const useColumnsAmount = () =>
  useMazeStore((state) => state.columnsAmount);

export const useRowsAmount = () => useMazeStore((state) => state.rowsAmount);

export const useIsMazeRendering = () =>
  useMazeStore((state) => state.isMazeRendering);

export const useSetIsMazeRendering = () =>
  useMazeStore((state) => state.setIsMazeRendering);

export const useTakeStepInSolution = () =>
  useMazeStore((state) => state.takeStepInSolution);

export const useSetMazeMode = () => useMazeStore((state) => state.setMazeMode);

export const useGenerateMaze = () =>
  useMazeStore((state) => state.generateMaze);

export const useMazeMode = () => useMazeStore((state) => state.mazeMode);

export const useMaxPathDistance = () =>
  useMazeStore((state) => state.maxPathDistance);

export const useAlgoDisplayMode = () =>
  useMazeStore((state) => state.displayMode);
