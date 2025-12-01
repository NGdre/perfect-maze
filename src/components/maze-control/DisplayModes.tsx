import { algoRegistry } from "@models/algorithm-registry";
import { useCurrentAlgoId } from "src/hooks/useCurrentAlgoId";
import { useMazeStore } from "src/stores";

import { useEffect } from "react";

import { ChoiceChips } from "../lib/choice-chips/ChoiceChips";
import MazeControlsHeading from "../lib/typography/MazeControlsHeading";

function DisplayModes() {
  const algoId = useCurrentAlgoId();
  const modes = algoRegistry.getDisplayModes(algoId);

  const setDisplayMode = useMazeStore((state) => state.setDisplayMode);

  useEffect(() => {
    if (modes.length < 2) {
      setDisplayMode(null);
    }
  }, [modes.length, setDisplayMode]);

  if (modes.length < 2) {
    return null;
  }

  return (
    <div>
      <MazeControlsHeading>режимы отображения</MazeControlsHeading>

      <ChoiceChips
        options={modes.map((mode) => ({ value: mode, label: mode }))}
        onChange={(mode) => mode && setDisplayMode(mode)}
      />
    </div>
  );
}

export default DisplayModes;
