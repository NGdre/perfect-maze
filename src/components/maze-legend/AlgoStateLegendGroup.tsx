import { SquareCell } from "@models/maze";

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
              });
            }}
            renderHeight={cellSize}
            renderWidth={cellSize}
            key={sample.name}
          />
        );
      })}
    </LegendGroup>
  );
}

export default AlgoStateLegendGroup;
