import { TimeDirection } from "src/stores/slices/mazeSolutionSlice";
import ClearMazeButton from "./ClearMazeButton";
import StopOrResumeButton from "./StopOrResumeButton";

export default function HistoryControls({
  onStep,
}: {
  onStep: (direction: TimeDirection) => boolean;
}) {
  return (
    <>
      <ClearMazeButton />
      <button onClick={() => onStep("backward")}>backward</button>;
      <StopOrResumeButton onStep={() => onStep("forward")} />
      <button onClick={() => onStep("forward")}>forward</button>;
    </>
  );
}
