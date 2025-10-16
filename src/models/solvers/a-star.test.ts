import { aStarVisualSchema } from "src/configs/visual";

import { type PolygonCell, generateRectMazeId } from "../maze";
import { aStarSerial, applyAStarVisual } from "./a-star";
import { idToCellMapFixture } from "./fixtures/id-to-cell-map-fixture";

jest.mock("./reconstruct-path", () => ({
  __esModule: true,
  reconstructPathSerial: jest.fn(function* () {
    yield* ["8,0", "1,1", "2,3"];
  }),
}));

describe("aStar", () => {
  const m = 5,
    n = 10;
  const start = generateRectMazeId(0, 0);
  const end = generateRectMazeId(m - 1, n - 1);

  it("solution steps have the right format", () => {
    const steps = [
      ...aStarSerial(
        start,
        end,
        idToCellMapFixture as Map<string, PolygonCell>,
      ),
    ];
    const pathSteps = steps.filter((step) => step.isPathCell);
    const nonPathSteps = steps.filter((step) => !step.isPathCell);

    const anyAStarCell = {
      id: expect.any(String),
      text: expect.objectContaining({
        "h-value": expect.any(String),
        "g-value": expect.any(String),
        "f-value": expect.any(String),
      }),
    };

    nonPathSteps.forEach((step) => {
      expect(step).toMatchObject({
        isPathCell: false,
        visited: expect.objectContaining(anyAStarCell),
      });

      expect(Array.isArray(step.enqueued)).toBe(true);

      if (step.enqueued.length > 0) {
        step.enqueued.forEach((item) => {
          expect(item).toMatchObject(anyAStarCell);
        });
      }
    });

    pathSteps.forEach((step, i) => {
      expect(step).toEqual({
        isPathCell: true,
        foundPath: ["1,1", "2,3"][i],
        prevCellId: ["8,0", "1,1"][i],
      });
    });
  });
});

describe("applyAStarVisual", () => {
  test("works as expected when isPathCell equals true", () => {
    const solutionStep = {
      isPathCell: true as const,
      prevCellId: "0,0",
      foundPath: "0,1",
    };

    expect(applyAStarVisual(solutionStep)).toEqual([
      {
        id: solutionStep.foundPath,
        color: aStarVisualSchema.foundPath.colors.background,
        lineColor: aStarVisualSchema.foundPath.colors.line,
        prevCellId: solutionStep.prevCellId,
        isPathCell: true,
      },
    ]);
  });

  test("when isPathCell equals false and there are no cells for enqueued array", () => {
    const solutionStep = {
      isPathCell: false as const,
      visited: {
        id: "0,0",
        text: {
          "h-value": "0",
          "g-value": "0",
          "f-value": "0",
        },
      },
      enqueued: [],
    };

    expect(applyAStarVisual(solutionStep)).toEqual([
      {
        id: solutionStep.visited.id,
        text: solutionStep.visited.text,
        color: aStarVisualSchema.visited.colors.background,
        isPathCell: false,
      },
    ]);
  });
});
