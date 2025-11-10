import { colors } from "@constants";
import { BoxConfig, TextStyle } from "@models/text-in-box-renderer";
import { AStarText } from "@solvers/a-star";

type CellConfig = {
  colors: {
    background: string;
    line?: string;
  };
  text?: Record<string, string>;
};

export type VisualSchema = Record<string, CellConfig>;

const baseVisualSchema: VisualSchema = {
  enqueued: {
    colors: {
      background: colors.ENQUEUED_CELL,
    },
  },
  visited: {
    colors: {
      background: colors.VISITED_CELL,
    },
  },
  foundPath: {
    colors: {
      line: colors.PATH_COLOR,
      background: colors.EMPTY_CELL,
    },
  },
} as const;

export const bfsVisualSchema: VisualSchema = {
  ...baseVisualSchema,
} as const;

export const aStarVisualSchema: VisualSchema = {
  ...baseVisualSchema,
} as const;

type AStarTextConfigOptions = {
  hValueStyles?: Partial<TextStyle>;
  gValueStyles?: Partial<TextStyle>;
  fValueStyles?: Partial<TextStyle>;
};

export const buildAStarTextConfig = (
  initialBoxConfig: Pick<BoxConfig, "x" | "y" | "size">,
  text: AStarText,
  options: AStarTextConfigOptions = {},
) => {
  const { hValueStyles, gValueStyles, fValueStyles } = options;

  // These constants were obtained experimentally.
  const p = 15;
  const fs1 = 3;
  const fs2 = 2;

  const mainPadding = initialBoxConfig.size / p;
  const fontForNumbers = "Barlow Condensed";
  const fontWeight = "200";
  const hColor = "#2e8b57";
  const gColor = hColor;
  const fColor = "#191970";

  const box: BoxConfig = { ...initialBoxConfig, texts: [] };

  const textBaseStyle = {
    fontSize: box.size / fs1,
    fontFamily: fontForNumbers,
    fontWeight,
    padding: mainPadding,
  };

  box.texts = [
    {
      ...textBaseStyle,
      content: text["g-value"],
      position: "top-left",
      color: gColor,
      ...gValueStyles,
    },
    {
      ...textBaseStyle,
      content: text["h-value"],
      position: "top-right",
      color: hColor,
      ...hValueStyles,
    },
    {
      ...textBaseStyle,
      content: text["f-value"],
      fontSize: box.size / fs2,
      position: "bottom",
      color: fColor,
      padding: mainPadding,
      ...fValueStyles,
    },
  ];

  return box;
};
