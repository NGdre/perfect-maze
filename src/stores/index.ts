import CellHistory from "@models/CellHistory";
import { MazeMode, MazeModeType } from "@models/algorithm-registry";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import {
  MazeConfigSlice,
  createMazeConfigSlice,
} from "./slices/mazeConfigSlice";
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
};

type Action = {
  setIsMazeRendering: (newStatus: State["isMazeRendering"]) => void;
  setMazeMode: (mazeMode: MazeModeType) => void;
};

export type MainStore = State &
  Action &
  MazeGenerationSlice &
  MazeSolutionSlice &
  MazeConfigSlice;

export const createMazeStore = (initialState: Partial<State> = {}) =>
  create<MainStore>()(
    immer((set, get, api) => {
      const cellHistory = new CellHistory();

      return {
        cellHistory,
        isMazeRendering: false,
        mazeMode: MazeMode.generation,
        ...initialState,

        ...createMazeGenerationSlice(set, get, api),
        ...createMazeSolutionSlice(set, get, api),
        ...createMazeConfigSlice(set, get, api),

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

export const getState = useMazeStore.getState;
