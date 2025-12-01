import { cellSelectionMode } from "@constants";
import { useMazeStore } from "@stores";

import { FiFlag, FiMapPin } from "react-icons/fi";

import { ChoiceChips } from "../lib/choice-chips/ChoiceChips";

export function StartOrEndChoiceChips() {
  const setCellSelection = useMazeStore((state) => state.setCellSelection);
  const isMazeRendering = useMazeStore((state) => state.isMazeRendering);
  const options = [
    {
      value: cellSelectionMode.start,
      label: "выбрать старт",
      icon: <FiFlag />,
      disabled: isMazeRendering,
    },
    {
      value: cellSelectionMode.end,
      label: "выбрать конец",
      icon: <FiMapPin />,
      disabled: isMazeRendering,
    },
  ];

  return (
    <ChoiceChips
      allowDeselect
      options={options}
      onChange={(currMode) => {
        if (currMode === cellSelectionMode.start)
          setCellSelection(cellSelectionMode.start);
        if (currMode === cellSelectionMode.end)
          setCellSelection(cellSelectionMode.end);
        if (!currMode) setCellSelection(cellSelectionMode.none);
      }}
    />
  );
}
