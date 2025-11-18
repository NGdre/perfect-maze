export type Position =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "center"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

export interface TextStyle {
  // Basic font properties
  fontSize: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;

  // Color and decoration
  color?: string; // kept for backward compatibility
  fillStyle?: string | CanvasGradient | CanvasPattern;
  strokeStyle?: string | CanvasGradient | CanvasPattern;
  lineWidth?: number; // only applied with strokeStyle

  // Transparency and effects
  opacity?: number;
  globalAlpha?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

export interface TextElement extends TextStyle {
  content: string;
  position: Position;
  padding?:
    | number
    | { top?: number; right?: number; bottom?: number; left?: number };
  offsetX?: number;
  offsetY?: number;
  maxWidth?: number;
}

export interface BoxConfig {
  x: number;
  y: number;
  size: number;
  texts: TextElement[];
}

interface TextMetrics {
  width: number;
  ascent: number;
  descent: number;
  height: number;
}

interface NormalizedPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export class TextInBoxRenderer {
  private boxes: BoxConfig[] = [];
  private textMetricsCache: Map<string, TextMetrics> = new Map();
  private ctx: CanvasRenderingContext2D;
  private measurementCanvas: HTMLCanvasElement;
  private measurementCtx: CanvasRenderingContext2D;

  constructor(context: CanvasRenderingContext2D) {
    this.ctx = context;

    this.measurementCanvas = document.createElement("canvas");
    const measurementCtx = this.measurementCanvas.getContext("2d");
    if (!measurementCtx) {
      throw new Error("Could not create measurement canvas context");
    }
    this.measurementCtx = measurementCtx;
  }

  addBox(box: BoxConfig): void {
    this.boxes.push(box);
  }

  addBoxes(boxes: BoxConfig[]): void {
    this.boxes.push(...boxes);
  }

  clearBoxes(): void {
    this.boxes = [];
    this.textMetricsCache.clear();
  }

  render(): void {
    this.drawBoxes();
  }

  addText(boxIndex: number, text: TextElement): void {
    if (this.boxes[boxIndex]) {
      this.boxes[boxIndex].texts.push(text);
    }
  }

  // Public method for testing text measurement - ТЕПЕРЬ ИСПОЛЬЗУЕТ КЭШ
  public testMeasureText(text: TextElement): TextMetrics {
    return this.getCachedTextMetrics(text);
  }

  // Public method for testing padding normalization
  public testNormalizePadding(
    padding?:
      | number
      | { top?: number; right?: number; bottom?: number; left?: number },
  ): NormalizedPadding {
    return this.normalizePadding(padding);
  }

  // Public method for testing font key generation
  public testGetFontKey(text: TextElement): string {
    return this.getFontKey(text);
  }

  // Public method for testing position calculation
  public testCalculateTextPosition(
    box: BoxConfig,
    text: TextElement,
    metrics: TextMetrics,
  ): { x: number; y: number } {
    return this.calculateTextPosition(box, text, metrics);
  }

  // Public method to get boxes count for testing
  public getBoxesCount(): number {
    return this.boxes.length;
  }

  // Public method to get cache size for testing
  public getCacheSize(): number {
    return this.textMetricsCache.size;
  }

  private getCachedTextMetrics(text: TextElement): TextMetrics {
    const fontKey = this.getFontKey(text);
    const cacheKey = `${text.content}|${fontKey}`;

    if (this.textMetricsCache.has(cacheKey)) {
      return this.textMetricsCache.get(cacheKey)!;
    }

    const metrics = this.measureText(text);
    this.textMetricsCache.set(cacheKey, metrics);
    return metrics;
  }

  private measureText(text: TextElement): TextMetrics {
    if (!text.content || text.fontSize <= 0) {
      return { width: 0, ascent: 0, descent: 0, height: 0 };
    }

    this.measurementCtx.save();

    this.applyTextStyles(this.measurementCtx, text);

    const metrics = this.measurementCtx.measureText(text.content);

    this.measurementCtx.restore();
    const width = metrics.width;

    const ascent = metrics.actualBoundingBoxAscent || text.fontSize * 0.8;
    const descent = metrics.actualBoundingBoxDescent || text.fontSize * 0.2;

    return {
      width,
      ascent,
      descent,
      height: ascent + descent,
    };
  }

  private getFontString(text: TextElement): string {
    const parts = [
      text.fontStyle || "normal",
      text.fontWeight || "normal",
      `${text.fontSize}px`,
      text.fontFamily || "sans-serif",
    ];

    return parts.join(" ");
  }

  private getFontKey(text: TextElement): string {
    return [
      text.fontStyle || "normal",
      text.fontWeight || "normal",
      text.fontSize,
      text.fontFamily || "sans-serif",
    ].join("|");
  }

  private normalizePadding(
    padding?:
      | number
      | { top?: number; right?: number; bottom?: number; left?: number },
  ): NormalizedPadding {
    if (typeof padding === "number") {
      return {
        top: padding,
        right: padding,
        bottom: padding,
        left: padding,
      };
    }

    return {
      top: padding?.top || 0,
      right: padding?.right || 0,
      bottom: padding?.bottom || 0,
      left: padding?.left || 0,
    };
  }

  private applyTextStyles(
    ctx: CanvasRenderingContext2D,
    text: TextElement,
  ): void {
    ctx.font = this.getFontString(text);
    ctx.textBaseline = "alphabetic";

    if (text.fillStyle) {
      ctx.fillStyle = text.fillStyle;
    } else if (text.color) {
      ctx.fillStyle = text.color;
    }

    if (text.strokeStyle) {
      ctx.strokeStyle = text.strokeStyle;
    }
    if (text.lineWidth) {
      ctx.lineWidth = text.lineWidth;
    }

    if (text.opacity !== undefined) {
      ctx.globalAlpha = text.opacity;
    } else if (text.globalAlpha !== undefined) {
      ctx.globalAlpha = text.globalAlpha;
    }

    if (text.shadowColor) {
      ctx.shadowColor = text.shadowColor;
      ctx.shadowBlur = text.shadowBlur || 0;
      ctx.shadowOffsetX = text.shadowOffsetX || 0;
      ctx.shadowOffsetY = text.shadowOffsetY || 0;
    }
  }

  private drawTextElement(
    ctx: CanvasRenderingContext2D,
    text: TextElement,
    x: number,
    y: number,
  ): void {
    ctx.save();

    this.applyTextStyles(ctx, text);

    // Stroke first, then fill - for correct rendering
    if (text.strokeStyle && text.lineWidth && text.lineWidth > 0) {
      if (text.maxWidth) {
        ctx.strokeText(text.content, x, y, text.maxWidth);
      } else {
        ctx.strokeText(text.content, x, y);
      }
    }

    // Then fill if there is fill style
    if (text.fillStyle || text.color) {
      if (text.maxWidth) {
        ctx.fillText(text.content, x, y, text.maxWidth);
      } else {
        ctx.fillText(text.content, x, y);
      }
    }

    ctx.restore();
  }

  private calculateTextPosition(
    box: BoxConfig,
    text: TextElement,
    metrics: TextMetrics,
  ): { x: number; y: number } {
    const padding = this.normalizePadding(text.padding);

    let x = box.x;
    if (text.position.includes("left")) {
      x += padding.left;
    } else if (text.position.includes("right")) {
      x += box.size - metrics.width - padding.right;
    } else {
      x += (box.size - metrics.width) / 2;
    }

    let y = box.y;
    if (text.position.includes("top")) {
      y += padding.top + metrics.ascent;
    } else if (text.position.includes("bottom")) {
      y += box.size - padding.bottom - metrics.descent;
    } else {
      y += (box.size + metrics.ascent - metrics.descent) / 2;
    }

    if (text.offsetX) x += text.offsetX;
    if (text.offsetY) y += text.offsetY;

    return { x, y };
  }

  private drawBoxes(): void {
    this.boxes.forEach((box) => {
      if (box.size <= 0) return;

      box.texts.forEach((text) => {
        if (text.fontSize <= 0 || !text.content) return;

        const metrics = this.getCachedTextMetrics(text);
        const position = this.calculateTextPosition(box, text, metrics);

        this.drawTextElement(this.ctx, text, position.x, position.y);
      });
    });
  }
}
