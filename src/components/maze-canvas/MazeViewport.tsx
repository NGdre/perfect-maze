import { CanvasLayersContainer } from "@components/lib/CanvasLayersContainer";
import { useMazeStore } from "src/stores/maze-store";

import { CanvasLayer } from "../lib/CanvasLayer";
import { CellMarksCanvasLayer } from "./CellMarksCanvasLayer";
import { CursorInteractionCanvasLayer } from "./CursorInteractionCanvasLayer";
import { InnerStateOfAlgoCanvasLayer } from "./InnerStateOfAlgoCanvasLayer";
import { MazeCanvasLayer } from "./MazeCanvasLayer";
import { MazePathCanvasLayer } from "./MazePathCanvasLayer";

const BGLayer = () => {
  return <CanvasLayer onRender={() => {}} className="!bg-white" />;
};

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
      <BGLayer />
      <InnerStateOfAlgoCanvasLayer />
      <MazeCanvasLayer />
      <MazePathCanvasLayer />
      <CellMarksCanvasLayer />
      <CursorInteractionCanvasLayer />
    </CanvasLayersContainer>
  );
}
