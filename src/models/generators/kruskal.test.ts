import { kruskal } from "./kruskal";

describe(kruskal.name, () => {
  it("should generate walls that will be removed", () => {
    const m = 10;
    const n = 20;

    const sampleGenerator = function* () {};

    expect(kruskal.constructor).toEqual(sampleGenerator.constructor);

    const result = [...kruskal(m, n)];

    for (let i = 0; i < result.length; i++) {
      expect(result[i].wallsToRemove[0]).toHaveLength(2);
    }
  });
});
