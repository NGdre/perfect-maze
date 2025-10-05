import {
  backwardHistory,
  createWallHistory,
  forwardHistory,
  forwardToEnd,
  getHistoryIndex,
  getHistoryState,
  type HistoryChange,
  saveHistoryChange,
  saveHistoryChanges,
} from "./wall-history";

describe("WallHistory", () => {
  test("createWallHistory", () => {
    const state = createWallHistory();

    expect(getHistoryIndex(state)).toBe(-1);
    expect(getHistoryState(state)).toHaveLength(0);
  });

  test("saveHistory should save a change", () => {
    let state = createWallHistory();
    const newChange: HistoryChange = ["1,1", "2,3"];

    state = saveHistoryChange(state, newChange);

    expect(getHistoryState(state).at(-1)).toEqual(newChange);
  });

  describe("forwardHistory", () => {
    test("should do nothing when currentIndex points to last change", () => {
      let state = createWallHistory();
      const newChange: HistoryChange = ["1,1", "2,3"];

      state = saveHistoryChange(state, newChange);
      const initialState = state;

      state = forwardHistory(state);

      expect(state).toBe(initialState); // No change
      expect(getHistoryIndex(state)).toBe(0);
    });

    test("should do nothing when history is empty", () => {
      let state = createWallHistory();
      const initialState = state;

      state = forwardHistory(state);

      expect(state).toBe(initialState); // No change
      expect(getHistoryIndex(state)).toBe(-1);
    });

    test("should change currentIndex to point to the last change when the change is saved", () => {
      let state = createWallHistory();

      const changes: Array<HistoryChange> = [
        ["1,1", "2,3"],
        ["2,3", "3,3"],
        ["5,1", "1,7"],
        ["6,4", "6,3"],
      ];

      for (const newChange of changes) {
        state = saveHistoryChange(state, newChange);
      }

      // Move backward twice
      state = backwardHistory(state);
      state = backwardHistory(state);

      // Save new change (should truncate future history)
      state = saveHistoryChange(state, ["2,3", "2,7"]);

      expect(getHistoryIndex(state)).toBe(3); // 4 changes total, index 3 means 4th element
      expect(getHistoryState(state)).toHaveLength(4);
    });
  });

  describe("backwardHistory", () => {
    test("should do nothing when currentIndex equals -1", () => {
      let state = createWallHistory();
      const initialState = state;

      state = backwardHistory(state);

      expect(state).toBe(initialState); // No change
      expect(getHistoryIndex(state)).toBe(-1);
    });
  });

  test("different amount of calls to forwardHistory and backwardHistory", () => {
    let state = createWallHistory();

    const changes: Array<HistoryChange> = [
      ["1,1", "2,3"],
      ["2,3", "3,3"],
      ["5,1", "1,7"],
      ["6,4", "6,3"],
    ];

    for (const newChange of changes) {
      state = saveHistoryChange(state, newChange);
    }

    // Move around in history
    state = backwardHistory(state); // index 2
    state = backwardHistory(state); // index 1
    state = backwardHistory(state); // index 0
    state = forwardHistory(state); // index 1

    const currentState = getHistoryState(state);
    expect(currentState[getHistoryIndex(state)]).toEqual(changes[1]);
    expect(currentState).toHaveLength(2); // Only first 2 changes are in current state
  });

  // Дополнительные тесты для лучшего покрытия
  test("should handle multiple forward operations", () => {
    let state = createWallHistory();

    const changes: Array<HistoryChange> = [
      ["1,1", "2,3"],
      ["2,3", "3,3"],
      ["5,1", "1,7"],
    ];

    for (const newChange of changes) {
      state = saveHistoryChange(state, newChange);
    }

    // Go back to beginning
    state = backwardHistory(state); // index 1
    state = backwardHistory(state); // index 0
    state = backwardHistory(state); // index -1

    // Go forward through all
    state = forwardHistory(state); // index 0
    expect(getHistoryIndex(state)).toBe(0);
    expect(getHistoryState(state)).toHaveLength(1);

    state = forwardHistory(state); // index 1
    expect(getHistoryIndex(state)).toBe(1);
    expect(getHistoryState(state)).toHaveLength(2);

    state = forwardHistory(state); // index 2
    expect(getHistoryIndex(state)).toBe(2);
    expect(getHistoryState(state)).toHaveLength(3);

    // Try to go beyond
    const finalState = state;
    state = forwardHistory(state);
    expect(state).toBe(finalState); // No change
  });

  test("save should truncate future history when not at the end", () => {
    let state = createWallHistory();

    const changes: Array<HistoryChange> = [
      ["1,1", "2,3"],
      ["2,3", "3,3"],
      ["5,1", "1,7"],
    ];

    for (const newChange of changes) {
      state = saveHistoryChange(state, newChange);
    }

    // Go back one step
    state = backwardHistory(state); // index 1

    // Save new change - should truncate the future
    state = saveHistoryChange(state, ["3,3", "4,4"]);

    expect(getHistoryIndex(state)).toBe(2);
    expect(getHistoryState(state)).toEqual([
      changes[0],
      changes[1],
      ["3,3", "4,4"],
    ]);
    expect(getHistoryState(state)).toHaveLength(3);
  });

  describe("saveHistoryChanges", () => {
    test("should save multiple changes at once", () => {
      let state = createWallHistory();

      const changes: HistoryChange[] = [
        ["1,1", "2,3"],
        ["2,3", "3,3"],
        ["5,1", "1,7"],
      ];

      state = saveHistoryChanges(state, changes);

      expect(getHistoryState(state)).toEqual(changes);
      expect(getHistoryIndex(state)).toBe(2); // Указывает на последний элемент
    });

    test("should handle empty changes array", () => {
      let state = createWallHistory();
      state = saveHistoryChange(state, ["1,1", "2,3"]);
      const initialState = state;

      state = saveHistoryChanges(state, []);

      expect(state).toBe(initialState); // Ничего не изменилось
    });

    test("should truncate future history when saving new changes", () => {
      let state = createWallHistory();

      // Создаем начальную историю
      const initialChanges: HistoryChange[] = [
        ["1,1", "2,3"],
        ["2,3", "3,3"],
        ["5,1", "1,7"],
      ];

      state = saveHistoryChanges(state, initialChanges);

      // Откатываемся на один шаг
      state = backwardHistory(state); // currentIndex = 1

      // Сохраняем новые изменения (должны отрезать будущее)
      const newChanges: HistoryChange[] = [
        ["3,3", "4,4"],
        ["4,4", "5,5"],
      ];

      state = saveHistoryChanges(state, newChanges);

      // Проверяем, что история была отрезана и новые изменения добавлены
      expect(getHistoryState(state)).toEqual([
        initialChanges[0],
        initialChanges[1],
        newChanges[0],
        newChanges[1],
      ]);
      expect(getHistoryIndex(state)).toBe(3);
    });
  });

  describe("forwardToEnd", () => {
    test("should jump to the end from middle of history", () => {
      let state = createWallHistory();

      const changes: HistoryChange[] = [
        ["1,1", "2,3"],
        ["2,3", "3,3"],
        ["5,1", "1,7"],
        ["6,4", "6,3"],
      ];

      for (const change of changes) {
        state = saveHistoryChange(state, change);
      }

      // Перемещаемся назад на два шага
      state = backwardHistory(state); // index 2
      state = backwardHistory(state); // index 1

      expect(getHistoryIndex(state)).toBe(1);
      expect(getHistoryState(state)).toHaveLength(2);

      // Перематываем до конца
      state = forwardToEnd(state);

      expect(getHistoryIndex(state)).toBe(3);
      expect(getHistoryState(state)).toEqual(changes);
    });

    test("should do nothing when already at the end", () => {
      let state = createWallHistory();

      state = saveHistoryChange(state, ["1,1", "2,3"]);
      state = saveHistoryChange(state, ["2,3", "3,3"]);

      const initialState = state;

      state = forwardToEnd(state);

      expect(state).toBe(initialState); // Ничего не изменилось
      expect(getHistoryIndex(state)).toBe(1);
    });

    test("should do nothing when history is empty", () => {
      let state = createWallHistory();
      const initialState = state;

      state = forwardToEnd(state);

      expect(state).toBe(initialState);
      expect(getHistoryIndex(state)).toBe(-1);
    });

    test("should work from the very beginning", () => {
      let state = createWallHistory();

      const changes: HistoryChange[] = [
        ["1,1", "2,3"],
        ["2,3", "3,3"],
        ["5,1", "1,7"],
      ];

      for (const change of changes) {
        state = saveHistoryChange(state, change);
      }

      // Перемещаемся в самое начало (до первого изменения)
      state = backwardHistory(state); // index 1
      state = backwardHistory(state); // index 0
      state = backwardHistory(state); // index -1

      expect(getHistoryIndex(state)).toBe(-1);
      expect(getHistoryState(state)).toHaveLength(0);

      // Перематываем до конца
      state = forwardToEnd(state);

      expect(getHistoryIndex(state)).toBe(2);
      expect(getHistoryState(state)).toEqual(changes);
    });
  });
});
