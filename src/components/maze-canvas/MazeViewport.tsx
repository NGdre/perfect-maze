import { CanvasLayersContainer } from "@components/lib/CanvasLayersContainer";
import { useMazeStore } from "src/stores/maze-store";

import { CellMarksCanvasLayer } from "./CellMarksCanvasLayer";
import { CursorInteractionCanvasLayer } from "./CursorInteractionCanvasLayer";
import { InnerStateOfAlgoCanvasLayer } from "./InnerStateOfAlgoCanvasLayer";
import { MazeCanvasLayer } from "./MazeCanvasLayer";
import { MazePathCanvasLayer } from "./MazePathCanvasLayer";

export default function MazeViewport({
  containerClassName,
}: {
  containerClassName?: string;
}) {
  const rows = useMazeStore((state) => state.rowsAmount);
  const columns = useMazeStore((state) => state.columnsAmount);
  const aspect = columns / rows;

  return (
    <CanvasLayersContainer
      targetAspect={aspect}
      containerClassName={containerClassName}
    >
      <InnerStateOfAlgoCanvasLayer />
      <MazeCanvasLayer />
      <MazePathCanvasLayer />
      <CellMarksCanvasLayer />
      <CursorInteractionCanvasLayer />
    </CanvasLayersContainer>
  );
}
