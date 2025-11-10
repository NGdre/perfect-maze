import CellHistory from "@models/CellHistory";
import { MazeMode, MazeModeType } from "@models/algorithm-registry";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import {
  MazeGenerationSlice,
  createMazeGenerationSlice,
} from "./slices/mazeGenerationSlice";
import {
  MazeSolutionSlice,
  createMazeSolutionSlice,
} from "./slices/mazeSolutionSlice";

type State = {
  isMazeRendering: boolean;
  cellHistory: CellHistory;
  mazeMode: MazeModeType;
  displayMode: null | string;
};

type Action = {
  setIsMazeRendering: (newStatus: State["isMazeRendering"]) => void;
  setMazeMode: (mazeMode: MazeModeType) => void;
};

export type MainStore = State &
  Action &
  MazeGenerationSlice &
  MazeSolutionSlice;

export const createMazeStore = (initialState: Partial<State> = {}) =>
  create<MainStore>()(
    immer((set, get, api) => {
      const cellHistory = new CellHistory();

      return {
        cellHistory,
        isMazeRendering: false,
        mazeMode: MazeMode.generation,
        displayMode: null,
        ...initialState,

        ...createMazeGenerationSlice(set, get, api),
        ...createMazeSolutionSlice(set, get, api),

        setIsMazeRendering(newStatus) {
          set({ isMazeRendering: newStatus });
        },

        setMazeMode(mazeMode) {
          if (mazeMode === MazeMode.generation) {
            get().resetSolution();
            set({ mazeMode });
          } else {
            set({ mazeMode });
          }
        },
      };
    }),
  );

export const useMazeStore = createMazeStore();
