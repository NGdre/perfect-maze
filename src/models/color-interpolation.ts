export type RGB = readonly [number, number, number] | [number, number, number];

export function interpolateColor(
  min: number,
  max: number,
  colors: readonly RGB[],
) {
  // Нужно перенести в другое место для производительсно
  // ow(
  //   colors,
  //   ow.array
  //     .minLength(2)
  //     .message("colors in interpolateColor must be at least length of 2"),
  // );
  return (value: number) => {
    if (value <= min) return rgbToCss(colors[0]);
    if (value >= max) return rgbToCss(colors[colors.length - 1]);

    const normalized = (value - min) / (max - min);

    const segmentSize = 1 / (colors.length - 1);
    const segmentIndex = Math.floor(normalized / segmentSize);
    const factor = (normalized % segmentSize) / segmentSize;

    const fromColor = colors[segmentIndex];
    const toColor = colors[segmentIndex + 1];

    const result = fromColor.map((channel, i) =>
      Math.round(channel + factor * (toColor[i] - channel)),
    ) as RGB;

    return rgbToCss(result);
  };
}

export function rgbToCss(rgb: RGB): string {
  return `rgb(${rgb.join(", ")})`;
}

// Helper function to convert hex colors to RGB
export function hexToRgb(hex: string): RGB {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}
