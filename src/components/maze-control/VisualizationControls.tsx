import { MazeMode } from "@models/algorithm-registry.ts";
import { useMazeStore } from "@stores";
import { useMazeMode } from "@stores/selectors.ts";
import { TimeDirection } from "@stores/slices/mazeSolutionSlice";

import {
  FiFastForward,
  FiRotateCcw,
  FiSkipBack,
  FiSkipForward,
} from "react-icons/fi";

import Button from "../lib/button/Button.tsx";
import Tooltip from "../lib/tooltip/Tooltip.tsx";
import PlayButton from "./PlayButton.tsx";

interface VisualizationControlsProps {
  onReset: () => void;
  onStep: (direction: TimeDirection) => boolean;
  onComplete: () => void;
  resetTooltipContent?: string;
  completeTooltipContent?: string;
}

export default function VisualizationControls({
  onReset,
  onStep,
  onComplete,
  resetTooltipContent,
  completeTooltipContent,
}: VisualizationControlsProps) {
  const isMazeRendering = useMazeStore((state) => state.isMazeRendering);
  const mazeMode = useMazeMode();
  const isMazeGenerationDone = useMazeStore(
    (state) => state.isMazeGenerationDone,
  );
  const isSerialSolverDone = useMazeStore((state) => state.isSerialSolverDone);

  const isAlgoDone =
    mazeMode === MazeMode.generation
      ? isMazeGenerationDone
      : isSerialSolverDone;

  return (
    <div className="flex w-full gap-5">
      <Button
        onClick={onReset}
        disabled={isMazeRendering}
        data-tooltip-id="reset-tooltip"
        data-tooltip-content={resetTooltipContent}
        variant="outline"
      >
        <FiRotateCcw />
      </Button>
      <Tooltip id="reset-tooltip" />

      <Button
        data-tooltip-id="backward-tooltip"
        data-tooltip-content="предыдущий шаг"
        variant="outline"
        onClick={() => onStep("backward")}
        disabled={isMazeRendering}
      >
        <FiSkipBack />
      </Button>
      <Tooltip id="backward-tooltip" />

      <PlayButton onStep={() => onStep("forward")} disabled={isAlgoDone} />

      <Button
        data-tooltip-id="forward-tooltip"
        data-tooltip-content="следующий шаг"
        variant="outline"
        onClick={() => onStep("forward")}
        disabled={isMazeRendering}
      >
        <FiSkipForward />
      </Button>
      <Tooltip id="forward-tooltip" />

      <Button
        disabled={isMazeRendering || isAlgoDone}
        onClick={onComplete}
        variant="outline"
        data-tooltip-id="complete-tooltip"
        data-tooltip-content={completeTooltipContent}
      >
        <FiFastForward />
      </Button>
      <Tooltip id="complete-tooltip" />
    </div>
  );
}
