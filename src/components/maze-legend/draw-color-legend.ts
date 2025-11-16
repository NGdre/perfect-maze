import { RGB, interpolateColor } from "@models/color-interpolation";
import ow from "ow";

export function drawColorLegend(
  canvas: HTMLCanvasElement,
  min: number,
  max: number,
  colors: readonly RGB[],
  options: {
    showTicks?: boolean;
    numTicks?: number;
    tickSize?: number;
    tickFont?: string;
    tickColor?: string;
    labelPrecision?: number;
    labelOffset?: number;
    step?: number;
  } = {},
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const {
    numTicks = 5,
    tickSize = 5,
    tickColor = "#000",
    tickFont = "12px Arial",
    labelPrecision = 0,
    labelOffset = 5,
    step = 1,
  } = options;

  ow(numTicks, ow.number.integer.greaterThanOrEqual(2));
  ow(labelPrecision, ow.number.integer.inRange(0, 3));

  let { showTicks = true } = options;
  if (min === max) showTicks = false;

  const width = canvas.width;
  const height = canvas.height;

  // this is hardcoded
  const tickLabelSpace = 20;
  const gradientHeight = showTicks ? height - tickLabelSpace : height;

  const colorInterpolator = interpolateColor(min, max, colors);

  ctx.clearRect(0, 0, width, height);

  for (let x = 0; x < width; x += step) {
    const value = min + (max - min) * (x / width);
    ctx.fillStyle = colorInterpolator(value);
    ctx.fillRect(x, 0, step, gradientHeight);
  }

  // legend border
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, width, gradientHeight);

  if (showTicks) {
    ctx.fillStyle = tickColor;
    ctx.font = tickFont;
    ctx.textBaseline = "top";

    for (let i = 0; i < numTicks; i++) {
      const value = min + (max - min) * (i / (numTicks - 1));
      const x = (i / (numTicks - 1)) * width;

      ctx.beginPath();
      ctx.moveTo(x, gradientHeight - tickSize);
      ctx.lineTo(x, gradientHeight);
      ctx.stroke();

      let textAlign: CanvasTextAlign = "center";
      let textX = x;

      if (i === 0) {
        textAlign = "left";
        textX = 0;
      } else if (i === numTicks - 1) {
        textAlign = "right";
        textX = width;
      }

      ctx.textAlign = textAlign;
      ctx.fillText(
        value.toFixed(labelPrecision),
        textX,
        gradientHeight + labelOffset,
      );
    }
  }
}
