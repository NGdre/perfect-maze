import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import CellHistory from "@models/CellHistory";
import {
  createMazeGenerationSlice,
  MazeGenerationSlice,
} from "./slices/mazeGenerationSlice";
import {
  createMazeSolutionSlice,
  MazeSolutionSlice,
} from "./slices/mazeSolutionSlice";

export const MazeMode = {
  generation: "generation",
  solving: "solving",
} as const;

export type MazeMode = (typeof MazeMode)[keyof typeof MazeMode];

type State = {
  isMazeRendering: boolean;
  cellHistory: CellHistory;
  mazeMode: MazeMode;
};

type Action = {
  setIsMazeRendering: (newStatus: State["isMazeRendering"]) => void;
  setMazeMode: (mazeMode: MazeMode) => void;
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
    })
  );

export const useMazeStore = createMazeStore();
