/**
 * @jest-environment jsdom
 */
import "jest-canvas-mock";

import {
  BoxConfig,
  TextElement,
  TextInBoxRenderer,
} from "./text-in-box-renderer";

describe("TextInBoxRenderer", () => {
  let ctx: CanvasRenderingContext2D;
  let renderer: TextInBoxRenderer;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d")!;
    renderer = new TextInBoxRenderer(ctx);

    jest.spyOn(ctx, "fillText");
    jest.spyOn(ctx, "strokeText");
    jest.spyOn(ctx, "save");
    jest.spyOn(ctx, "restore");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic functionality", () => {
    test("should create instance", () => {
      expect(renderer).toBeInstanceOf(TextInBoxRenderer);
    });

    test("should add box", () => {
      const box: BoxConfig = {
        x: 10,
        y: 10,
        size: 100,
        texts: [],
      };

      renderer.addBox(box);
      expect(renderer.getBoxesCount()).toBe(1);
    });

    test("should add multiple boxes", () => {
      const boxes: BoxConfig[] = [
        { x: 10, y: 10, size: 100, texts: [] },
        { x: 50, y: 50, size: 200, texts: [] },
      ];

      renderer.addBoxes(boxes);
      expect(renderer.getBoxesCount()).toBe(2);
    });

    test("should clear boxes", () => {
      const box: BoxConfig = { x: 10, y: 10, size: 100, texts: [] };
      renderer.addBox(box);

      renderer.clearBoxes();
      expect(renderer.getBoxesCount()).toBe(0);
      expect(renderer.getCacheSize()).toBe(0);
    });
  });

  describe("Text measurement", () => {
    test("should measure text with basic styles", () => {
      const text: TextElement = {
        content: "Hello World",
        position: "center",
        fontSize: 16,
      };

      const metrics = renderer.testMeasureText(text);

      expect(metrics).toHaveProperty("width");
      expect(metrics).toHaveProperty("height");
      expect(metrics).toHaveProperty("ascent");
      expect(metrics).toHaveProperty("descent");
      expect(metrics.height).toBe(metrics.ascent + metrics.descent);
    });

    test("should return zero metrics for empty text", () => {
      const text: TextElement = {
        content: "",
        position: "center",
        fontSize: 16,
      };

      const metrics = renderer.testMeasureText(text);

      expect(metrics.width).toBe(0);
      expect(metrics.height).toBe(0);
      expect(metrics.ascent).toBe(0);
      expect(metrics.descent).toBe(0);
    });

    test("should return zero metrics for zero font size", () => {
      const text: TextElement = {
        content: "Test",
        position: "center",
        fontSize: 0,
      };

      const metrics = renderer.testMeasureText(text);

      expect(metrics.width).toBe(0);
      expect(metrics.height).toBe(0);
    });
  });

  describe("Padding normalization", () => {
    test("should normalize number padding", () => {
      const padding = 10;
      const result = renderer.testNormalizePadding(padding);

      expect(result).toEqual({
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
      });
    });

    test("should normalize object padding", () => {
      const padding = { top: 5, right: 10, bottom: 15, left: 20 };
      const result = renderer.testNormalizePadding(padding);

      expect(result).toEqual(padding);
    });

    test("should normalize partial object padding", () => {
      const padding = { top: 5, bottom: 15 };
      const result = renderer.testNormalizePadding(padding);

      expect(result).toEqual({
        top: 5,
        right: 0,
        bottom: 15,
        left: 0,
      });
    });

    test("should handle undefined padding", () => {
      const result = renderer.testNormalizePadding();

      expect(result).toEqual({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      });
    });
  });

  describe("Font key generation", () => {
    test("should generate font key with all properties", () => {
      const text: TextElement = {
        content: "Test",
        position: "center",
        fontSize: 16,
        fontFamily: "Arial",
        fontWeight: "bold",
        fontStyle: "italic",
      };

      const key = renderer.testGetFontKey(text);
      expect(key).toBe("italic|bold|16|Arial");
    });

    test("should generate font key with default values", () => {
      const text: TextElement = {
        content: "Test",
        position: "center",
        fontSize: 16,
      };

      const key = renderer.testGetFontKey(text);
      expect(key).toBe("normal|normal|16|sans-serif");
    });
  });

  describe("Text positioning", () => {
    const baseBox: BoxConfig = {
      x: 100,
      y: 100,
      size: 200,
      texts: [],
    };

    test("should calculate center position", () => {
      const text: TextElement = {
        content: "Test",
        position: "center",
        fontSize: 16,
      };

      const metrics = { width: 50, ascent: 12, descent: 4, height: 16 };
      const position = renderer.testCalculateTextPosition(
        baseBox,
        text,
        metrics,
      );

      expect(position.x).toBe(100 + (200 - 50) / 2);
      expect(position.y).toBe(100 + (200 + 12 - 4) / 2);
    });

    test("should calculate top-left position with padding", () => {
      const text: TextElement = {
        content: "Test",
        position: "top-left",
        fontSize: 16,
        padding: 10,
      };

      const metrics = { width: 50, ascent: 12, descent: 4, height: 16 };
      const position = renderer.testCalculateTextPosition(
        baseBox,
        text,
        metrics,
      );

      expect(position.x).toBe(100 + 10);
      expect(position.y).toBe(100 + 10 + 12);
    });

    test("should calculate bottom-right position with offset", () => {
      const text: TextElement = {
        content: "Test",
        position: "bottom-right",
        fontSize: 16,
        padding: 5,
        offsetX: 10,
        offsetY: -5,
      };

      const metrics = { width: 50, ascent: 12, descent: 4, height: 16 };
      const position = renderer.testCalculateTextPosition(
        baseBox,
        text,
        metrics,
      );

      expect(position.x).toBe(100 + 200 - 50 - 5 + 10);
      expect(position.y).toBe(100 + 200 - 5 - 4 - 5);
    });

    test("should handle left position", () => {
      const text: TextElement = {
        content: "Test",
        position: "left",
        fontSize: 16,
      };

      const metrics = { width: 50, ascent: 12, descent: 4, height: 16 };
      const position = renderer.testCalculateTextPosition(
        baseBox,
        text,
        metrics,
      );

      expect(position.x).toBe(100);
      expect(position.y).toBe(100 + (200 + 12 - 4) / 2);
    });
  });

  describe("Rendering", () => {
    test("should render text with fill style", () => {
      const box: BoxConfig = {
        x: 10,
        y: 10,
        size: 100,
        texts: [
          {
            content: "Hello World",
            position: "center",
            fontSize: 16,
            fillStyle: "red",
          },
        ],
      };

      renderer.addBox(box);
      renderer.render();

      expect(ctx.fillText).toHaveBeenCalledWith(
        "Hello World",
        expect.any(Number),
        expect.any(Number),
      );
    });

    test("should render text with stroke style", () => {
      const box: BoxConfig = {
        x: 10,
        y: 10,
        size: 100,
        texts: [
          {
            content: "Stroked Text",
            position: "center",
            fontSize: 16,
            strokeStyle: "blue",
            lineWidth: 2,
          },
        ],
      };

      renderer.addBox(box);
      renderer.render();

      expect(ctx.strokeText).toHaveBeenCalledWith(
        "Stroked Text",
        expect.any(Number),
        expect.any(Number),
      );
    });

    test("should render text with both fill and stroke", () => {
      const box: BoxConfig = {
        x: 10,
        y: 10,
        size: 100,
        texts: [
          {
            content: "Dual Text",
            position: "center",
            fontSize: 16,
            fillStyle: "red",
            strokeStyle: "blue",
            lineWidth: 1,
          },
        ],
      };

      renderer.addBox(box);
      renderer.render();

      expect(ctx.fillText).toHaveBeenCalled();
      expect(ctx.strokeText).toHaveBeenCalled();
    });

    test("should skip rendering for empty text content", () => {
      const box: BoxConfig = {
        x: 10,
        y: 10,
        size: 100,
        texts: [
          {
            content: "",
            position: "center",
            fontSize: 16,
          },
        ],
      };

      renderer.addBox(box);
      renderer.render();

      expect(ctx.fillText).not.toHaveBeenCalled();
      expect(ctx.strokeText).not.toHaveBeenCalled();
    });

    test("should skip rendering for zero font size", () => {
      const box: BoxConfig = {
        x: 10,
        y: 10,
        size: 100,
        texts: [
          {
            content: "Test",
            position: "center",
            fontSize: 0,
          },
        ],
      };

      renderer.addBox(box);
      renderer.render();

      expect(ctx.fillText).not.toHaveBeenCalled();
      expect(ctx.strokeText).not.toHaveBeenCalled();
    });

    test("should skip rendering for zero box size", () => {
      const box: BoxConfig = {
        x: 10,
        y: 10,
        size: 0,
        texts: [
          {
            content: "Test",
            position: "center",
            fontSize: 16,
          },
        ],
      };

      renderer.addBox(box);
      renderer.render();

      expect(ctx.fillText).not.toHaveBeenCalled();
      expect(ctx.strokeText).not.toHaveBeenCalled();
    });

    test("should call save and restore for each box", () => {
      const boxes: BoxConfig[] = [
        {
          x: 10,
          y: 10,
          size: 100,
          texts: [
            {
              content: "First",
              position: "center",
              fontSize: 16,
            },
          ],
        },
        {
          x: 50,
          y: 50,
          size: 150,
          texts: [
            {
              content: "Second",
              position: "center",
              fontSize: 14,
            },
          ],
        },
      ];

      renderer.addBoxes(boxes);
      renderer.render();

      expect(ctx.save).toHaveBeenCalledTimes(2);
      expect(ctx.restore).toHaveBeenCalledTimes(2);
    });
  });

  describe("Cache functionality", () => {
    test("should cache text metrics", () => {
      const text: TextElement = {
        content: "Cache Test",
        position: "center",
        fontSize: 16,
      };

      const initialCacheSize = renderer.getCacheSize();

      const metrics1 = renderer.testMeasureText(text);

      const metrics2 = renderer.testMeasureText(text);

      expect(renderer.getCacheSize()).toBe(initialCacheSize + 1);
      // Проверяем что метрики одинаковые (по значениям, так как это разные объекты)
      expect(metrics1.width).toBe(metrics2.width);
      expect(metrics1.height).toBe(metrics2.height);
    });

    test("should generate different cache keys for different texts", () => {
      const text1: TextElement = {
        content: "First Text",
        position: "center",
        fontSize: 16,
      };

      const text2: TextElement = {
        content: "Second Text",
        position: "center",
        fontSize: 16,
      };

      const initialCacheSize = renderer.getCacheSize();

      renderer.testMeasureText(text1);
      renderer.testMeasureText(text2);

      expect(renderer.getCacheSize()).toBe(initialCacheSize + 2);
    });

    test("should clear cache when clearing boxes", () => {
      const text: TextElement = {
        content: "Test",
        position: "center",
        fontSize: 16,
      };

      renderer.testMeasureText(text);
      expect(renderer.getCacheSize()).toBeGreaterThan(0);

      renderer.clearBoxes();
      expect(renderer.getCacheSize()).toBe(0);
    });
  });
});
