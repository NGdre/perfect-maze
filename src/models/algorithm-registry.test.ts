import {
  AlgorithmRegistry,
  MazeMode,
  MazeModeType,
} from "./algorithm-registry";

describe("AlgorithmRegistry", () => {
  let registry: AlgorithmRegistry;

  const mockAlgorithm1 = {
    name: "Test Algorithm 1",
    type: MazeMode.generation,
    func: jest.fn(),
  };

  const mockAlgorithm2 = {
    name: "Test Algorithm 2",
    type: MazeMode.solving,
    func: jest.fn(),
  };

  beforeEach(() => {
    registry = new AlgorithmRegistry();
  });

  describe("push", () => {
    it("should add algorithm and return correct ID", () => {
      const id = registry.push(mockAlgorithm1);

      expect(id).toBe(0);
    });

    it("should increment ID for each new algorithm", () => {
      const firstId = registry.push(mockAlgorithm1);
      const secondId = registry.push(mockAlgorithm2);

      expect(firstId).toBe(0);
      expect(secondId).toBe(1);
    });

    it("should not mutate input config object", () => {
      const originalConfig = { ...mockAlgorithm1 };
      registry.push(mockAlgorithm1);

      expect(mockAlgorithm1).toEqual(originalConfig);
    });

    it("should create readonly config with correct properties", () => {
      const id = registry.push(mockAlgorithm1);
      const config = registry.findConfigById(id);

      expect(config.id).toBe(0);
      expect(config.name).toBe("Test Algorithm 1");
      expect(config.type).toBe(MazeMode.generation);
      expect(config.func).toBe(mockAlgorithm1.func);
    });
  });

  describe("findConfigById", () => {
    beforeEach(() => {
      registry.push(mockAlgorithm1);
    });

    it("should return config for existing ID", () => {
      const config = registry.findConfigById(0);

      expect(config.id).toBe(0);
      expect(config.name).toBe("Test Algorithm 1");
      expect(config.type).toBe(MazeMode.generation);
    });

    it("should throw error for non-existing ID", () => {
      expect(() => registry.findConfigById(999)).toThrow(
        "there's no algorithm config with id 999",
      );
    });
  });

  describe("findAlgoById", () => {
    beforeEach(() => {
      registry.push(mockAlgorithm1);
    });

    it("should return algorithm function for existing ID", () => {
      const algoFunc = registry.findAlgoById(0);

      expect(algoFunc).toBe(mockAlgorithm1.func);
    });

    it("should throw error for non-existing ID", () => {
      expect(() => registry.findAlgoById(999)).toThrow();
    });
  });

  describe("getName", () => {
    beforeEach(() => {
      registry.push(mockAlgorithm1);
    });

    it("should return algorithm name for existing ID", () => {
      const name = registry.getName(0);

      expect(name).toBe("Test Algorithm 1");
    });

    it("should throw error for non-existing ID", () => {
      expect(() => registry.getName(999)).toThrow();
    });
  });

  describe("getGroup", () => {
    beforeEach(() => {
      registry.push(mockAlgorithm1);
      registry.push(mockAlgorithm2);
      registry.push({
        ...mockAlgorithm1,
        name: "Test Algorithm 3",
      });
    });

    it("should return IDs for generation type", () => {
      const result = registry.getGroup(MazeMode.generation);

      expect(result).toEqual([0, 2]);
    });

    it("should return IDs for solving type", () => {
      const result = registry.getGroup(MazeMode.solving);

      expect(result).toEqual([1]);
    });

    it("should return empty array for non-existing type", () => {
      const result = registry.getGroup("non_existent" as MazeModeType);

      expect(result).toEqual([]);
    });

    it("should maintain ID order from registration", () => {
      const result = registry.getGroup(MazeMode.generation);

      expect(result).toEqual([0, 2]); // IDs in insertion order
    });
  });

  describe("edge cases", () => {
    it("should handle empty registry correctly", () => {
      expect(registry.getGroup(MazeMode.generation)).toEqual([]);
      expect(registry.getGroup(MazeMode.solving)).toEqual([]);
      expect(() => registry.findConfigById(0)).toThrow();
    });

    it("should handle large number of registrations", () => {
      for (let i = 0; i < 5; i++) {
        const id = registry.push({
          name: `Algorithm ${i}`,
          type: i % 2 === 0 ? MazeMode.generation : MazeMode.solving,
          func: jest.fn(),
        });
        expect(id).toBe(i); // ID должны быть последовательными
      }

      expect(registry.getGroup(MazeMode.generation).length).toBe(3);
      expect(registry.getGroup(MazeMode.solving).length).toBe(2);
    });
  });

  describe("integration tests", () => {
    it("should handle multiple operations correctly", () => {
      const id1 = registry.push(mockAlgorithm1);
      const id2 = registry.push(mockAlgorithm2);

      expect(registry.getName(id1)).toBe("Test Algorithm 1");
      expect(registry.getName(id2)).toBe("Test Algorithm 2");

      expect(registry.getGroup(MazeMode.generation)).toEqual([id1]);
      expect(registry.getGroup(MazeMode.solving)).toEqual([id2]);

      expect(registry.findAlgoById(id1)).toBe(mockAlgorithm1.func);
      expect(registry.findAlgoById(id2)).toBe(mockAlgorithm2.func);
    });

    it("should maintain data integrity after multiple operations", () => {
      const initialMazeCount = registry.getGroup(MazeMode.generation).length;
      const initialSolveCount = registry.getGroup(MazeMode.solving).length;

      registry.push(mockAlgorithm1);
      registry.push(mockAlgorithm2);

      const mazeAlgos = registry.getGroup(MazeMode.generation);
      const solveAlgos = registry.getGroup(MazeMode.solving);

      expect(mazeAlgos.length).toBe(initialMazeCount + 1);
      expect(solveAlgos.length).toBe(initialSolveCount + 1);

      [...mazeAlgos, ...solveAlgos].forEach((id) => {
        expect(() => registry.findConfigById(id)).not.toThrow();
      });
    });
  });
});
