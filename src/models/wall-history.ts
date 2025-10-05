export type HistoryChange = [string, string];
export type WallHistoryState = Array<HistoryChange>;

export interface WallHistoryAPI {
  getState: (state: WallHistorySnapshot) => WallHistoryState;
  forward: (state: WallHistorySnapshot) => WallHistorySnapshot;
  backward: (state: WallHistorySnapshot) => WallHistorySnapshot;
  save: (
    state: WallHistorySnapshot,
    change: HistoryChange
  ) => WallHistorySnapshot;
  isEmpty: (state: WallHistorySnapshot) => boolean;
  clear: () => WallHistorySnapshot;
  getHistoryIndex: (state: WallHistorySnapshot) => number;
}

export interface WallHistorySnapshot {
  history: WallHistoryState;
  currentIndex: number;
}

export const createWallHistory = (): WallHistorySnapshot => ({
  history: [],
  currentIndex: -1,
});

export const saveHistoryChange = (
  state: WallHistorySnapshot,
  change: HistoryChange
): WallHistorySnapshot => {
  const newHistory =
    state.currentIndex < state.history.length - 1
      ? state.history.slice(0, state.currentIndex + 1)
      : state.history;

  return {
    history: [...newHistory, change],
    currentIndex: newHistory.length,
  };
};

export const saveHistoryChanges = (
  state: WallHistorySnapshot,
  changes: HistoryChange[]
): WallHistorySnapshot => {
  if (changes.length === 0) {
    return state;
  }

  const newHistory =
    state.currentIndex < state.history.length - 1
      ? state.history.slice(0, state.currentIndex + 1)
      : state.history;

  const updatedHistory = [...newHistory, ...changes];

  return {
    history: updatedHistory,
    currentIndex: updatedHistory.length - 1,
  };
};

export const forwardHistory = (
  state: WallHistorySnapshot
): WallHistorySnapshot => {
  if (state.currentIndex >= state.history.length - 1) {
    return state;
  }

  return {
    ...state,
    currentIndex: state.currentIndex + 1,
  };
};

export const backwardHistory = (
  state: WallHistorySnapshot
): WallHistorySnapshot => {
  if (state.currentIndex <= -1) {
    return state;
  }

  return {
    ...state,
    currentIndex: state.currentIndex - 1,
  };
};

export const getHistoryState = (
  state: WallHistorySnapshot
): WallHistoryState => {
  return state.history.slice(0, state.currentIndex + 1);
};

export const isHistoryEmpty = (state: WallHistorySnapshot): boolean => {
  return state.history.length === 0;
};

export const clearHistory = (): WallHistorySnapshot => {
  return createWallHistory();
};

export const getHistoryIndex = (state: WallHistorySnapshot): number => {
  return state.currentIndex;
};

export const forwardToEnd = (
  state: WallHistorySnapshot
): WallHistorySnapshot => {
  if (state.currentIndex >= state.history.length - 1) {
    return state;
  }

  return {
    ...state,
    currentIndex: state.history.length - 1,
  };
};
