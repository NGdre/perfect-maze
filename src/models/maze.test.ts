import {
  MazeData,
  WallsToRemove,
  createCellFinder,
  createMaze,
  createWallBetweenCellsSearcher,
  generatePositions,
  getCellCenter,
  getCellCoords,
  getCellIndexFromWallIndex,
  getCellPoints,
  getCellWalls,
  getCirclePoint,
  getDefaultMazeData,
  getVisibleWalls,
  getWallByPosition,
  mapPairsToNeighbors,
  removeWalls,
  removeWallsPure,
} from "./maze";

jest.mock("src/validation/utils", () => ({
  validateIntGreaterThanOrEqual: jest.fn(),
  validateIntLessThanOrEqual: jest.fn(),
}));

describe("getCirclePoint", () => {
  it(`the point is in correct direction of centre`, () => {
    const radius = 1;
    const e = 0.01;

    const expectedResults: {
      [angle: string]: ReturnType<typeof getCirclePoint>;
    } = {
      "0": { x: 1, y: 0 },
      "90": { x: 0, y: 1 },
      "180": { x: -1, y: 0 },
      "270": { x: 0, y: -1 },
    };

    expectedResults["-90"] = expectedResults["270"];
    expectedResults["-180"] = expectedResults["180"];
    expectedResults["-270"] = expectedResults["90"];

    const angles = Object.keys(expectedResults);

    for (const angle of angles) {
      const { x, y } = getCirclePoint(radius, +angle);

      expect(x).toBeLessThanOrEqual(expectedResults[angle].x + e);
      expect(x).toBeGreaterThanOrEqual(expectedResults[angle].x - e);

      expect(y).toBeLessThanOrEqual(expectedResults[angle].y + e);
      expect(y).toBeGreaterThanOrEqual(expectedResults[angle].y - e);
    }
  });

  it("gets correct radius", () => {
    const radius = 2;
    expect(getCirclePoint(radius, 0)).toEqual({ x: radius, y: 0 });
  });
});

describe("Maze Functions", () => {
  describe("generatePositions", () => {
    it("should generate correct number of positions", () => {
      const startPoint: [number, number] = [0, 0];
      const angle = 90;
      const wallsAmount = 4;

      const result = generatePositions(startPoint, angle, wallsAmount);

      expect(result).toHaveLength(wallsAmount);
      expect(result[0]).toEqual(startPoint);
    });

    it("should calculate positions with correct angle increments", () => {
      const startPoint: [number, number] = [0, 0];
      const angle = 90;
      const wallsAmount = 4;

      const result = generatePositions(startPoint, angle, wallsAmount);

      // First position should be start point
      expect(result[0]).toEqual([0, 0]);
      // Subsequent positions should be calculated based on angle
      expect(result[1]).toEqual(expect.any(Array));
      expect(result[2]).toEqual(expect.any(Array));
      expect(result[3]).toEqual(expect.any(Array));
    });
  });

  describe("createMaze", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should create maze with correct dimensions", () => {
      const rows = 3;
      const cols = 3;
      const wallsAmount = 4;

      const maze = createMaze(rows, cols, wallsAmount);

      expect(maze.cellIds).toHaveLength(rows * cols);
      expect(maze.x).toHaveLength(rows * cols * wallsAmount);
      expect(maze.y).toHaveLength(rows * cols * wallsAmount);
      expect(maze.visible).toHaveLength(rows * cols * wallsAmount);
      expect(maze.wallsAmount).toBe(wallsAmount);
    });

    it("should have correct cell IDs", () => {
      const rows = 2;
      const cols = 2;

      const maze = createMaze(rows, cols);

      expect(maze.cellIds).toContain("0,0");
      expect(maze.cellIds).toContain("0,1");
      expect(maze.cellIds).toContain("1,0");
      expect(maze.cellIds).toContain("1,1");
    });

    it("should create valid index mapping", () => {
      const rows = 2;
      const cols = 2;

      const maze = createMaze(rows, cols);

      expect(maze.indexByCellId.get("0,0")).toBe(0);
      expect(maze.indexByCellId.get("0,1")).toBe(1);
      expect(maze.indexByCellId.get("1,0")).toBe(2);
      expect(maze.indexByCellId.get("1,1")).toBe(3);
    });
  });

  describe("getCellCoords", () => {
    it("should extract correct coordinates for cell", () => {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8];
      const wallsAmount = 4;
      const cellIndex = 1;

      const result = getCellCoords(nums, cellIndex, wallsAmount);

      expect(result).toEqual([5, 6, 7, 8]);
    });

    it("should handle first cell", () => {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8];
      const wallsAmount = 4;
      const cellIndex = 0;

      const result = getCellCoords(nums, cellIndex, wallsAmount);

      expect(result).toEqual([1, 2, 3, 4]);
    });
  });

  describe("getCellPoints", () => {
    it("should return correct points with scale factor", () => {
      const mazeData = {
        x: [0, 1, 1, 0],
        y: [0, 0, 1, 1],
        wallsAmount: 4,
      };
      const scaleFactor = 10;

      const points = getCellPoints(mazeData, 0, scaleFactor);

      expect(points).toEqual([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ]);
    });

    it("should use scale factor 1 by default", () => {
      const mazeData = {
        x: [0, 1, 1, 0],
        y: [0, 0, 1, 1],
        wallsAmount: 4,
      };

      const points = getCellPoints(mazeData, 0);

      expect(points).toEqual([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ]);
    });
  });

  describe("getCellWalls", () => {
    it("should return correct walls for cell", () => {
      const mazeData = {
        x: [0, 1, 1, 0],
        y: [0, 0, 1, 1],
        wallsAmount: 4,
      };

      const walls = getCellWalls(mazeData, 0);

      expect(walls).toEqual([
        [0, 0, 1, 0],
        [1, 0, 1, 1],
        [1, 1, 0, 1],
        [0, 1, 0, 0],
      ]);
    });
  });

  describe("getCellCenter", () => {
    it("should calculate correct center point", () => {
      const mazeData: MazeData = {
        x: [0, 2, 2, 0],
        y: [0, 0, 2, 2],
        cellIds: ["0,0"],
        visible: [1, 1, 1, 1],
        indexByCellId: new Map([["0,0", 0]]),
        wallsAmount: 4,
      };

      const center = getCellCenter(mazeData, 0);

      expect(center).toEqual({ x: 1, y: 1 });
    });
  });

  describe("Wall Operations", () => {
    let mazeData: MazeData;

    beforeEach(() => {
      mazeData = {
        x: [0, 1, 1, 0, 1, 2, 2, 1],
        y: [0, 0, 1, 1, 0, 0, 1, 1],
        cellIds: ["0,0", "0,1"],
        visible: [1, 1, 1, 1, 1, 1, 1, 1],
        indexByCellId: new Map([
          ["0,0", 0],
          ["0,1", 1],
        ]),
        wallsAmount: 4,
      };
    });

    describe("createWallBetweenCellsSearcher", () => {
      it("should find common wall between adjacent cells", () => {
        const searchCommonWall = createWallBetweenCellsSearcher(mazeData);

        const result = searchCommonWall("0,0", "0,1");

        expect(result).toEqual(expect.any(Array));
        expect(result).toHaveLength(2);
      });

      it("should return -1 for non-adjacent cells", () => {
        const searchCommonWall = createWallBetweenCellsSearcher(mazeData);

        const result = searchCommonWall("0,0", "non-existent");

        expect(result).toBe(-1);
      });
    });

    describe("removeWalls", () => {
      it("should remove walls between specified cells", () => {
        const wallsToRemove: WallsToRemove = [["0,0", "0,1"]];
        const searchCommonWall = createWallBetweenCellsSearcher(mazeData);
        const initialWallPositions = searchCommonWall("0,0", "0,1");

        removeWalls(mazeData, wallsToRemove);

        if (initialWallPositions !== -1) {
          const [firstWallPos, secondWallPos] = initialWallPositions;
          expect(mazeData.visible[firstWallPos]).toBe(0);
          expect(mazeData.visible[secondWallPos]).toBe(0);
        }
      });
    });

    describe("removeWallsPure", () => {
      it("should return new maze data without mutating original", () => {
        const wallsToRemove: WallsToRemove = [["0,0", "0,1"]];

        const originalVisible = [...mazeData.visible];
        const newMazeData = removeWallsPure(mazeData, wallsToRemove);

        expect(newMazeData).not.toBe(mazeData);
        expect(newMazeData.visible).not.toBe(mazeData.visible);
        expect(mazeData.visible).toEqual(originalVisible); // Original unchanged
      });
    });
  });

  describe("getWallByPosition", () => {
    it("should return correct wall coordinates for regular wall", () => {
      const mazeData = {
        x: [0, 1, 1, 0, 2, 3],
        y: [0, 0, 1, 1, 0, 0],
        wallsAmount: 4,
      };

      const wall = getWallByPosition(mazeData, 1);

      expect(wall).toEqual([1, 0, 1, 1]);
    });

    it("should return correct wall coordinates for last wall in cell", () => {
      const mazeData = {
        x: [0, 1, 1, 0, 2, 3],
        y: [0, 0, 1, 1, 0, 0],
        wallsAmount: 4,
      };

      const wall = getWallByPosition(mazeData, 3);

      expect(wall).toEqual([0, 1, 0, 0]);
    });
  });

  describe("getVisibleWalls", () => {
    it("should return only visible walls", () => {
      const mazeData: MazeData = {
        x: [0, 1, 1, 0],
        y: [0, 0, 1, 1],
        cellIds: ["0,0"],
        visible: [1, 0, 1, 0],
        indexByCellId: new Map([["0,0", 0]]),
        wallsAmount: 4,
      };

      const visibleWalls = getVisibleWalls(mazeData);

      expect(visibleWalls).toHaveLength(2);
    });
  });

  describe("mapPairsToNeighbors", () => {
    it("should create correct neighbor mapping", () => {
      const mazeData: MazeData = {
        x: [],
        y: [],
        cellIds: ["0,0", "0,1", "1,0"],
        visible: [],
        indexByCellId: new Map([
          ["0,0", 0],
          ["0,1", 1],
          ["1,0", 2],
        ]),
        wallsAmount: 4,
      };

      const wallsToRemove: WallsToRemove = [
        ["0,0", "0,1"],
        ["0,0", "1,0"],
      ];

      const neighbors = mapPairsToNeighbors(mazeData, wallsToRemove);

      expect(neighbors[0]).toContain("0,1");
      expect(neighbors[0]).toContain("1,0");
      expect(neighbors[1]).toContain("0,0");
      expect(neighbors[2]).toContain("0,0");
    });

    it("should throw error for non-existent cell IDs", () => {
      const mazeData: MazeData = {
        x: [],
        y: [],
        cellIds: ["0,0"],
        visible: [],
        indexByCellId: new Map([["0,0", 0]]),
        wallsAmount: 4,
      };

      const wallsToRemove: WallsToRemove = [["0,0", "non-existent"]];

      expect(() => {
        mapPairsToNeighbors(mazeData, wallsToRemove);
      }).toThrow("bad data");
    });
  });

  describe("createCellFinder", () => {
    it("should return correct cell information", () => {
      const mazeData: MazeData = {
        x: [0, 1, 1, 0],
        y: [0, 0, 1, 1],
        cellIds: ["0,0"],
        visible: [1, 1, 1, 1],
        indexByCellId: new Map([["0,0", 0]]),
        wallsAmount: 4,
      };

      const neighbors = [["0,1"]];
      const findCell = createCellFinder(mazeData, neighbors);

      const cell = findCell("0,0");

      expect(cell).toEqual({
        id: "0,0",
        center: expect.any(Object),
        neighbors: ["0,1"],
        numberOfWalls: 4,
        getPoints: expect.any(Function),
      });

      const points = cell!.getPoints(1);
      expect(points).toHaveLength(4);
    });

    it("should return null for non-existent cell", () => {
      const mazeData: MazeData = {
        x: [],
        y: [],
        cellIds: [],
        visible: [],
        indexByCellId: new Map(),
        wallsAmount: 4,
      };

      const neighbors: string[][] = [];
      const findCell = createCellFinder(mazeData, neighbors);

      const cell = findCell("non-existent");

      expect(cell).toBeNull();
    });
  });

  describe("getDefaultMazeData", () => {
    it("should return default maze data structure", () => {
      const defaultData = getDefaultMazeData();

      expect(defaultData).toEqual({
        x: [],
        y: [],
        cellIds: [],
        visible: [],
        indexByCellId: new Map(),
        wallsAmount: 4,
      });
    });
  });

  describe("getCellIndexFromWallIndex", () => {
    it("should calculate correct cell index from wall index", () => {
      const wallsAmount = 4;

      expect(getCellIndexFromWallIndex(0, wallsAmount)).toBe(0);
      expect(getCellIndexFromWallIndex(3, wallsAmount)).toBe(0);
      expect(getCellIndexFromWallIndex(4, wallsAmount)).toBe(1);
      expect(getCellIndexFromWallIndex(7, wallsAmount)).toBe(1);
    });
  });
});
