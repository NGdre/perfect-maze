import { colors } from "@constants";
import { SquareCell } from "@models/maze";
import {
  drawLine as createLineRenderer,
  drawFinish,
  drawHoveredCell,
  drawStart,
} from "@models/maze-canvas-rendering";
import { clamp } from "@utils";
import { aStarVisualSchema } from "src/configs/visual";
import { useWindowSize } from "src/hooks/useWindowSize";

import { useRef, useState } from "react";
import { FiHelpCircle } from "react-icons/fi";

import Button from "../lib/button/Button";
import { Popup } from "../lib/dialog/Popup";
import LegendGroup from "../lib/legend/LegendGroup";
import LegendItem from "../lib/legend/LegendItem";
import AlgoStateLegendGroup from "./AlgoStateLegendGroup";

function MazeLegend() {
  const [showLegend, setShowLegend] = useState(false);

  const cellRef = useRef<SquareCell | null>(null);

  if (!cellRef.current) {
    cellRef.current = new SquareCell("");
    cellRef.current.generateWalls(0, 0);
  }

  const cell = cellRef.current;

  const { width } = useWindowSize();

  // make cellSize responsive
  const cellSize = clamp(width / 50, 25, 50);

  const groupClassName = "flex gap-7";

  return (
    <>
      <Button
        onClick={() => setShowLegend(true)}
        variant="outline"
        className="mt-5"
      >
        <FiHelpCircle />
        legend
      </Button>

      <Popup
        onClose={() => setShowLegend(false)}
        isOpen={showLegend}
        showCloseButton
        className="space-y-10"
      >
        <AlgoStateLegendGroup
          groupName="algorithm state"
          cellSize={cellSize}
          className={groupClassName}
        />

        <LegendGroup
          className={groupClassName}
          groupName="marks"
          itemProps={{ renderWidth: cellSize, renderHeight: cellSize }}
        >
          <LegendItem
            name="start"
            onRender={(renderOptions) =>
              drawStart(renderOptions.ctx, cell, cellSize)
            }
          />
          <LegendItem
            name="finish"
            onRender={(renderOptions) =>
              drawFinish(renderOptions.ctx, cell, cellSize)
            }
          />
          <LegendItem
            name="hovered"
            onRender={(renderOptions) =>
              drawHoveredCell(renderOptions.ctx, cell, cellSize)
            }
          />
        </LegendGroup>

        <LegendGroup
          className={groupClassName}
          groupName="lines"
          itemProps={{ renderWidth: cellSize, renderHeight: cellSize }}
          renderOptions={{ scaleFactor: cellSize, lineWidth: 3 }}
        >
          <LegendItem
            name="wall"
            onRender={(renderOptions) =>
              createLineRenderer({
                ...renderOptions,
                strokeStyle: colors.WALL_COLOR,
              })(0, 0.5, 1, 0.5)
            }
          />
          <LegendItem
            name="found path"
            onRender={(renderOptions) =>
              createLineRenderer({
                ...renderOptions,
                strokeStyle: aStarVisualSchema.foundPath.colors.line,
              })(0, 0.5, 1, 0.5)
            }
          />
        </LegendGroup>
      </Popup>
    </>
  );
}

export default MazeLegend;
