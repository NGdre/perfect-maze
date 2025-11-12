import { CanvasLayer } from "@components/lib/CanvasLayer";
import { colors } from "@constants";
import { drawPolygon } from "@models/maze-canvas-rendering";
import { TextInBoxRenderer } from "@models/text-in-box-renderer";
import { AStarText } from "@solvers/a-star";
import { useMazeStore } from "@stores";
import {
  useColumnsAmount,
  useCurrVisualMazeChange,
  useIsCellHistoryEmpty,
} from "@stores/selectors";
import { scalePolygonFromCenter } from "@utils";
import { buildAStarTextConfig } from "src/configs/visual";
import { useIdToCellMap } from "src/hooks/useIdToCellMap";

import { useCallback, useEffect, useRef } from "react";

import fontForNumbers from "../../assets/fonts/BarlowCondensed-Light.ttf";

const fontForNumbersName = "Barlow Condensed";
const ERASE_CELL_RATIO = 1;

export const TextInCellsCanvasLayer = () => {
  const change = useCurrVisualMazeChange();
  const isCellHistoryEmpty = useIsCellHistoryEmpty();
  const columns = useColumnsAmount();

  const cellHistoryState = useMazeStore((state) =>
    state.cellHistory.getState(),
  );

  const rendererRef = useRef<TextInBoxRenderer | null>(null);

  useEffect(() => {
    const isAlreadyLoaded = Array.from(document.fonts).some(
      (font) => font.family === fontForNumbersName,
    );

    if (isAlreadyLoaded) return;

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

  const idToCellMap = useIdToCellMap();

  const renderPath = useCallback(
    function (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      _dpr: number,
      isResized: boolean,
    ) {
      if (isCellHistoryEmpty) ctx.clearRect(0, 0, width, height);

      if (width === 0 || columns === 0 || !change || !idToCellMap) return;

      const cellSize = width / columns;

      const shouldRedraw = isResized || !rendererRef.current;

      const changes = shouldRedraw ? [...cellHistoryState.values()] : change;

      if (!rendererRef.current) {
        rendererRef.current = new TextInBoxRenderer(ctx);
      } else {
        rendererRef.current.clearBoxes();
      }

      const renderer = rendererRef.current;
      const boxesToRender = []; // batching all the boxes for drawing

      for (const cellChange of changes) {
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

        const currCellPos = currCell.getPoints(cellSize)[0];

        const textInCellConfig = buildAStarTextConfig(
          Object.assign(currCellPos, { size: cellSize }),
          cellChange.text as AStarText,
        );

        boxesToRender.push(textInCellConfig);
      }

      // rendering all boxes with one call
      if (boxesToRender.length > 0) {
        renderer.addBoxes(boxesToRender);
        renderer.render();
      }
    },
    [isCellHistoryEmpty, change, columns, idToCellMap],
  );

  return <CanvasLayer onRender={renderPath} />;
};
