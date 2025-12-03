import { searchParams } from "@constants";
import { useCurrentAlgoId } from "@hooks/useCurrentAlgoId";
import { useSyncUrlParam } from "@hooks/useSyncUrlParam";
import { algoRegistry } from "@models/algorithm-registry";
import { useMazeStore } from "@stores";

import { useEffect } from "react";

import { ChoiceChips } from "../lib/choice-chips/ChoiceChips";
import MazeControlsHeading from "../lib/typography/MazeControlsHeading";

function DisplayModes() {
  const algoId = useCurrentAlgoId();
  const modes = algoRegistry.getDisplayModes(algoId);

  const setDisplayMode = useMazeStore((state) => state.setDisplayMode);

  useEffect(() => {
    if (modes.length === 0) {
      setDisplayMode(null);
    }
  }, [modes.length, setDisplayMode]);

  const { updateParamInUrl: updateParams, currentParamValue: paramValue } =
    useSyncUrlParam(searchParams.DISPLAY_MODE, setDisplayMode);

  if (modes.length === 0) {
    return null;
  }

  return (
    <div>
      <MazeControlsHeading>режимы отображения</MazeControlsHeading>

      <ChoiceChips
        options={modes.map((mode) => ({ value: mode, label: mode }))}
        onChange={(mode) => mode && updateParams(mode)}
        initialValue={paramValue}
      />
    </div>
  );
}

export default DisplayModes;
