import fc from "fast-check";

import { recursiveBacktracking } from "./recursive-backtracking";

describe(recursiveBacktracking.name, () => {
  it("is generator", () => {
    const sampleGenerator = function* () {};

    expect(recursiveBacktracking.constructor).toEqual(
      sampleGenerator.constructor,
    );
  });

  it("should generate cell pairs for walls that will be removed", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 15 }),
        fc.integer({ min: 2, max: 15 }),
        (m, n) => {
          const result = [...recursiveBacktracking(m, n)];

          for (let i = 0; i < result.length; i++) {
            expect(result[i].wallsToRemove[0]).toHaveLength(2);
          }
        },
      ),
    );
  });
});
