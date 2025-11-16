import {
  A_STAR_DISPLAY_MODES,
  A_STAR_ID,
  BFS_ID,
} from "@models/algorithm-registry";
import { PolygonCell } from "@models/maze";
import { drawCell } from "@models/maze-canvas-rendering";
import { TextInBoxRenderer, TextStyle } from "@models/text-in-box-renderer";
import {
  aStarVisualSchema,
  bfsVisualSchema,
  buildAStarTextConfig,
} from "src/configs/visual";
import { colors } from "src/constants";

import { LegendItemProps } from "../lib/legend/LegendItem";
import { drawColorLegend } from "./draw-color-legend";

export interface LegendSample {
  readonly name: string;
  readonly onRender: LegendRenderFunction;
  canvasWidth?: number;
  canvasHeight?: number;
  labelPosition?: LegendItemProps["namePosition"];
}

export type LegendRenderFunction = (params: {
  ctx: CanvasRenderingContext2D;
  cell: PolygonCell;
  cellSize: number;
  maxDistance: number;
}) => void;

export interface LegendSampleConfig {
  readonly algorithmId: number;
  readonly displayMode?: string;
  readonly samples: readonly LegendSample[];
}

const createCellRenderer =
  (background: string): LegendRenderFunction =>
  ({ ctx, cell, cellSize }) =>
    drawCell(ctx, cell, cellSize, { background });

const createTextRenderer =
  (configOptions: Record<string, Partial<TextStyle>>): LegendRenderFunction =>
  ({ ctx, cell, cellSize }) => {
    const { x, y } = cell.getPoints(cellSize)[0];

    const aStarTextSample = {
      "h-value": "3",
      "g-value": "5",
      "f-value": "8",
    };

    const textConfig = buildAStarTextConfig(
      { size: cellSize, x, y },
      aStarTextSample,
      configOptions,
    );

    ctx.canvas.className = "border border-WALL_COLOR";
    const renderer = new TextInBoxRenderer(ctx);
    renderer.addBox(textConfig);
    renderer.render();
  };

const colorLegendCreator: LegendRenderFunction = ({ ctx, maxDistance }) => {
  drawColorLegend(ctx.canvas, 0, maxDistance, colors.heatmapRGBStops, {
    tickFont: "14px Arial",
  });
};

const activeTextStyles = {
  fontWeight: 700,
} as const;

const inactiveTextStyles = {
  opacity: 0.3,
} as const;

// if the structure of config changes, code will break, but config is only used in hook, so it's ok
export const legendSampleConfigs: readonly LegendSampleConfig[] = [
  {
    algorithmId: A_STAR_ID,
    displayMode: A_STAR_DISPLAY_MODES.base,
    samples: [
      {
        name: "enqueued",
        onRender: createCellRenderer(
          aStarVisualSchema.enqueued.colors.background,
        ),
      },
      {
        name: "visited",
        onRender: createCellRenderer(
          aStarVisualSchema.visited.colors.background,
        ),
      },
    ],
  },

  {
    algorithmId: A_STAR_ID,
    displayMode: A_STAR_DISPLAY_MODES.text,
    samples: [
      {
        name: "g value",
        // a little repetions is fine
        onRender: createTextRenderer({
          hValueStyles: inactiveTextStyles,
          fValueStyles: inactiveTextStyles,
          gValueStyles: activeTextStyles,
        }),
      },
      {
        name: "h value",
        onRender: createTextRenderer({
          fValueStyles: inactiveTextStyles,
          gValueStyles: inactiveTextStyles,
          hValueStyles: activeTextStyles,
        }),
      },
      {
        name: "f value",
        onRender: createTextRenderer({
          hValueStyles: inactiveTextStyles,
          gValueStyles: inactiveTextStyles,
          fValueStyles: activeTextStyles,
        }),
      },
    ],
  },

  {
    algorithmId: A_STAR_ID,
    displayMode: A_STAR_DISPLAY_MODES.heatmap,
    samples: [
      {
        name: "Значения h-value (левее — ближе к финишу, правее — ближе к старту)",
        onRender: colorLegendCreator,
        canvasWidth: 200,
        canvasHeight: 50,
        labelPosition: "top",
      },
    ],
  },

  {
    algorithmId: BFS_ID,
    samples: [
      {
        name: "enqueued",
        onRender: createCellRenderer(
          bfsVisualSchema.enqueued.colors.background,
        ),
      },
      {
        name: "visited",
        onRender: createCellRenderer(bfsVisualSchema.visited.colors.background),
      },
    ],
  },
] as const;
