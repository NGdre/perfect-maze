import { CanvasLayer } from "@components/lib/CanvasLayer";
import { colors } from "@constants";
import { createIdToCellMap } from "@models/maze";
import { drawPolygon } from "@models/maze-canvas-rendering";
import { TextInBoxRenderer } from "@models/text-in-box-renderer";
import { AStarText } from "@solvers/a-star";
import {
  useColumnsAmount,
  useCurrVisualMazeChange,
  useIsCellHistoryEmpty,
  useMazeCells,
} from "@stores/selectors";
import { scalePolygonFromCenter } from "@utils";
import { buildTextInCellConfig } from "src/configs/visual";

import { useCallback, useEffect } from "react";

import fontForNumbers from "../../assets/fonts/BarlowCondensed-Light.ttf";

const fontForNumbersName = "Barlow Condensed";
const ERASE_CELL_RATIO = 1;

export const TextInCellsCanvasLayer = () => {
  const change = useCurrVisualMazeChange();
  const isCellHistoryEmpty = useIsCellHistoryEmpty();
  const cells = useMazeCells();
  const columns = useColumnsAmount();

  useEffect(() => {
    const loadFont = async () => {
      try {
        const font = new FontFace(fontForNumbersName, `url(${fontForNumbers})`);
        await font.load();
        document.fonts.add(font);
      } catch (error) {
        console.error("Error loading font:", error);
      }
    };

    loadFont();
  }, []);

  const renderPath = useCallback(
    async function (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
    ) {
      if (isCellHistoryEmpty) ctx.clearRect(0, 0, width, height);

      if (width === 0 || columns === 0 || !change || !cells) return;

      const cellSize = width / columns;

      const idToCellMap = createIdToCellMap(cells);

      const renderer = new TextInBoxRenderer(ctx);

      for (const cellChange of change) {
        const currCell = idToCellMap.get(cellChange.id);

        if (!currCell) continue;

        const isPathCell = cellChange.isPathCell;

        if (isPathCell || !cellChange.text) {
          drawPolygon(
            ctx,
            scalePolygonFromCenter(
              currCell.getPoints(cellSize),
              ERASE_CELL_RATIO,
            ),
            colors.EMPTY_CELL,
          );
          continue;
        }

        if (!cellChange.text) continue;

        const currCellPos = currCell.getPoints(cellSize)[0];

        const textInCellConfig = buildTextInCellConfig(
          Object.assign(currCellPos, { size: cellSize }),
          cellChange.text as AStarText,
        );

        renderer.addBox(textInCellConfig);
        renderer.render();
      }
    },
    [isCellHistoryEmpty, cells, change, columns],
  );

  return <CanvasLayer onRender={renderPath} />;
};
