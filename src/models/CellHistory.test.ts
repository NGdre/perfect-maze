import CellHistory, { CellPatch } from "./CellHistory";

describe("CellHistory", () => {
  let history: CellHistory;

  beforeEach(() => {
    history = new CellHistory();
  });

  // Helper function to get cell safely
  const getCell = (id: string) => {
    return history.getState().get(id);
  };

  describe("Initialization", () => {
    it("should initialize with empty state", () => {
      expect(history.getState().size).toBe(0);
      expect(history.historyIndex).toBe(-1);
      expect(history.isEmpty()).toBe(true);
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);
    });
  });

  describe("applyStep", () => {
    it("should add new cell", () => {
      const patch: CellPatch = { id: "1", name: "Cell 1" };
      history.applyStep([patch]);

      expect(getCell("1")).toEqual({ id: "1", name: "Cell 1" });
      expect(history.historyIndex).toBe(0);
      expect(history.canUndo()).toBe(true);
    });

    it("should update existing cell", () => {
      history.applyStep([{ id: "1", name: "Cell 1" }]);
      history.applyStep([{ id: "1", name: "Updated Cell 1", value: 10 }]);

      const cell = getCell("1");
      expect(cell).toEqual({
        id: "1",
        name: "Updated Cell 1",
        value: 10,
      });
    });

    it("should delete property with undefined", () => {
      history.applyStep([{ id: "1", name: "Cell 1", value: 10 }]);
      history.applyStep([{ id: "1", value: undefined }]);

      const cell = getCell("1");
      expect(cell).toEqual({ id: "1", name: "Cell 1" });
    });

    it("should merge nested objects", () => {
      history.applyStep([{ id: "1", data: { a: 1 } }]);
      history.applyStep([{ id: "1", data: { b: 2 } }]);

      const cell = getCell("1");
      expect(cell).toEqual({
        id: "1",
        data: { a: 1, b: 2 },
      });
    });

    it("should completely delete cell with $deleted", () => {
      history.applyStep([{ id: "1", name: "Cell 1" }]);
      history.applyStep([{ id: "1", $deleted: true }]);

      expect(history.getState().has("1")).toBe(false);
    });

    it("should handle multiple cells in one step", () => {
      history.applyStep([
        { id: "1", name: "Cell 1" },
        { id: "2", name: "Cell 2" },
      ]);

      const state = history.getState();
      expect(state.size).toBe(2);
      expect(getCell("1")?.name).toBe("Cell 1");
      expect(getCell("2")?.name).toBe("Cell 2");
    });

    it("should override previous changes in same step", () => {
      history.applyStep([
        { id: "1", name: "First" },
        { id: "1", name: "Second" },
      ]);

      expect(getCell("1")?.name).toBe("Second");
    });
  });

  describe("applyMultipleSteps", () => {
    it("should flatten and apply multiple steps", () => {
      history.applyMultipleSteps([
        [{ id: "1", name: "Cell 1" }],
        [{ id: "2", name: "Cell 2" }],
      ]);

      expect(history.getState().size).toBe(2);
      expect(history.historyIndex).toBe(0);
    });
  });

  describe("undo/redo", () => {
    it("should undo single step", () => {
      history.applyStep([{ id: "1", name: "Cell 1" }]);
      history.undo();

      expect(history.getState().size).toBe(0);
      expect(history.historyIndex).toBe(-1);
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(true);
    });

    it("should redo undone step", () => {
      history.applyStep([{ id: "1", name: "Cell 1" }]);
      history.undo();
      history.redo();

      expect(getCell("1")).toEqual({ id: "1", name: "Cell 1" });
      expect(history.historyIndex).toBe(0);
    });

    it("should handle complex undo/redo", () => {
      history.applyStep([{ id: "1", name: "Cell 1" }]);
      history.applyStep([{ id: "1", value: 10 }]);

      history.undo();
      expect(getCell("1")).toEqual({ id: "1", name: "Cell 1" });

      history.undo();
      expect(history.getState().size).toBe(0);

      history.redo();
      expect(getCell("1")).toEqual({ id: "1", name: "Cell 1" });

      history.redo();
      expect(getCell("1")).toEqual({
        id: "1",
        name: "Cell 1",
        value: 10,
      });
    });

    it("check backward patch for complex state", () => {
      history.applyStep([
        {
          color: "#b0c4b1",
          id: "0,0",
          isPathFound: false,
        },
      ]);

      history.applyStep([
        {
          color: "grey",
          id: "0,0",
          isPathFound: true,
          lineColor: "#ffb703",
          prevCellId: "0,1",
        },
      ]);

      expect(history.historyCurrentStep.backward).toEqual([
        {
          id: "0,0",
          color: "#b0c4b1",
          isPathFound: false,
        },
      ]);
    });

    it("should clear redo stack on new action", () => {
      history.applyStep([{ id: "1", name: "Cell 1" }]);
      history.undo();
      history.applyStep([{ id: "2", name: "Cell 2" }]);

      expect(history.canRedo()).toBe(false);
      expect(history.historyIndex).toBe(0);
      expect(history.getState().size).toBe(1);
    });
  });

  describe("edge cases", () => {
    it("should ignore undo/redo when impossible", () => {
      history.undo();
      history.redo();
      expect(history.getState().size).toBe(0);
    });

    it("should handle deleting non-existent cell", () => {
      history.applyStep([{ id: "1", $deleted: true }]);
      expect(history.getState().size).toBe(0);
    });

    it("should generate correct backward patch for new cell", () => {
      history.applyStep([{ id: "1", name: "Cell 1" }]);
      const step = history.historyCurrentStep;

      expect(step?.backward[0]).toEqual({
        id: "1",
        $deleted: true,
      });
      expect(step?.forward[0]).toEqual({
        id: "1",
        name: "Cell 1",
      });
    });

    it("should return immutable state", () => {
      history.applyStep([{ id: "1", name: "Cell 1" }]);
      const state = history.getState();

      // Try to modify the state
      const cell = state.get("1");
      if (cell) {
        // Create modified clone without affecting original
        const modifiedCell = { ...cell, name: "Modified" };
        state.set("1", modifiedCell);
      }

      // Internal state should remain unchanged
      expect(history.getState().get("1")?.name).toBe("Cell 1");
    });
  });

  describe("clear", () => {
    it("should reset all state", () => {
      history.applyStep([{ id: "1", name: "Cell 1" }]);
      history.clear();

      expect(history.getState().size).toBe(0);
      expect(history.historyIndex).toBe(-1);
      expect(history.isEmpty()).toBe(true);
    });
  });

  describe("getLastPropertyChange", () => {
    test("should return null when no changes exist", () => {
      const result = history.getLastPropertyChange("cell-1", "color");
      expect(result).toBeNull();
    });

    test("should find last change for specific property", () => {
      history.applyStep([
        { id: "cell-1", color: "red" },
        { id: "cell-2", color: "blue" },
      ]);

      history.applyStep([{ id: "cell-1", color: "green", size: 10 }]);

      const result = history.getLastPropertyChange("cell-1", "color");

      expect(result).toEqual({
        value: "green",
        stepIndex: 1,
      });
    });

    test("should find change from correct step index", () => {
      history.applyStep([{ id: "cell-1", color: "red" }]);

      history.applyStep([{ id: "cell-1", color: "blue" }]);

      history.applyStep([{ id: "cell-1", color: "green" }]);

      const result = history.getLastPropertyChange("cell-1", "color");
      expect(result?.stepIndex).toBe(2);
      expect(result?.value).toBe("green");
    });

    test("should work with undo/redo operations", () => {
      history.applyStep([{ id: "cell-1", color: "red" }]);

      history.applyStep([{ id: "cell-1", color: "blue" }]);

      history.undo();

      const resultAfterUndo = history.getLastPropertyChange("cell-1", "color");
      expect(resultAfterUndo).toEqual({
        value: "red",
        stepIndex: 0,
      });

      history.redo();

      const resultAfterRedo = history.getLastPropertyChange("cell-1", "color");
      expect(resultAfterRedo).toEqual({
        value: "blue",
        stepIndex: 1,
      });
    });

    test("should return null when property was never changed", () => {
      history.applyStep([{ id: "cell-1", size: 10 }]);

      history.applyStep([{ id: "cell-1", shape: "circle" }]);

      const result = history.getLastPropertyChange("cell-1", "color");
      expect(result).toBeNull();
    });

    test("should return null when cell was never changed", () => {
      history.applyStep([{ id: "cell-2", color: "red" }]);

      const result = history.getLastPropertyChange("cell-1", "color");
      expect(result).toBeNull();
    });

    test("should handle property deletion (undefined value)", () => {
      history.applyStep([{ id: "cell-1", color: "red", visible: true }]);

      history.applyStep([{ id: "cell-1", color: undefined }]);

      const result = history.getLastPropertyChange("cell-1", "color");
      expect(result?.value).toBeUndefined();
      expect(result?.stepIndex).toBe(1);
    });

    test("should handle cell deletion", () => {
      history.applyStep([{ id: "cell-1", color: "red" }]);

      history.applyStep([{ id: "cell-1", $deleted: true }]);

      history.applyStep([{ id: "cell-1", color: "blue" }]);

      const result = history.getLastPropertyChange("cell-1", "color");
      expect(result?.value).toBe("blue");
      expect(result?.stepIndex).toBe(2);
    });

    test("should find nested object properties", () => {
      history.applyStep([
        {
          id: "cell-1",
          style: { color: "red", fontSize: 12 },
        },
      ]);

      history.applyStep([
        {
          id: "cell-1",
          style: { color: "blue" },
        },
      ]);

      const result = history.getLastPropertyChange("cell-1", "style");
      expect(result?.value).toEqual({ color: "blue" });
    });

    test("should work with multiple properties in same step", () => {
      history.applyStep([
        {
          id: "cell-1",
          color: "red",
          size: 10,
          visible: true,
        },
      ]);

      const colorResult = history.getLastPropertyChange("cell-1", "color");
      const sizeResult = history.getLastPropertyChange("cell-1", "size");
      const visibleResult = history.getLastPropertyChange("cell-1", "visible");

      expect(colorResult?.value).toBe("red");
      expect(sizeResult?.value).toBe(10);
      expect(visibleResult?.value).toBe(true);
      expect(colorResult?.stepIndex).toBe(0);
    });

    test("should handle multiple cells changing same property", () => {
      history.applyStep([
        { id: "cell-1", color: "red" },
        { id: "cell-2", color: "blue" },
      ]);

      history.applyStep([{ id: "cell-1", color: "green" }]);

      const cell1Result = history.getLastPropertyChange("cell-1", "color");
      const cell2Result = history.getLastPropertyChange("cell-2", "color");

      expect(cell1Result?.value).toBe("green");
      expect(cell2Result?.value).toBe("blue");
    });

    test("should return correct step index after multiple operations", () => {
      history.applyStep([{ id: "cell-1", color: "red" }]);

      history.applyStep([{ id: "cell-1", color: "blue" }]);

      history.applyStep([{ id: "cell-1", color: "green" }]);

      history.undo();
      history.undo();

      history.applyStep([{ id: "cell-1", color: "yellow" }]);

      const result = history.getLastPropertyChange("cell-1", "color");
      expect(result?.value).toBe("yellow");
      expect(result?.stepIndex).toBe(1);
    });
  });
});
