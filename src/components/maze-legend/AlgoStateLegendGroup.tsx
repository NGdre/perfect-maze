import { SquareCell } from "@models/maze";
import { useMaxPathDistance } from "@stores/selectors";

import LegendGroup from "../lib/legend/LegendGroup";
import LegendItem from "../lib/legend/LegendItem";
import { useSymbolSamples } from "./useSymbolSamples";

interface CellLegendProps {
  cellSize: number;
  groupName?: string;
  className?: string;
}

function AlgoStateLegendGroup({
  cellSize,
  groupName,
  className,
}: CellLegendProps) {
  const samples = useSymbolSamples();
  const maxDistance = useMaxPathDistance();

  const cell = new SquareCell("");
  cell.generateWalls(0, 0);

  return (
    <LegendGroup className={className} groupName={groupName}>
      {samples.map((sample) => {
        return (
          <LegendItem
            name={sample.name}
            onRender={(renderOptions) => {
              sample.onRender({
                ctx: renderOptions.ctx,
                cell,
                cellSize,
                maxDistance,
              });
            }}
            renderHeight={sample.canvasHeight || cellSize}
            renderWidth={sample.canvasWidth || cellSize}
            key={sample.name}
          />
        );
      })}
    </LegendGroup>
  );
}

export default AlgoStateLegendGroup;
