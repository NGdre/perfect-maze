import { FiFlag, FiMapPin } from "react-icons/fi";
import { useMazeStore } from "@stores";
import { ChoiceChips } from "../lib/choice-chips/ChoiceChips";

export function StartOrEndChoiceChips() {
  const setCellSelection = useMazeStore((state) => state.setCellSelection);
  const isMazeRendering = useMazeStore((state) => state.isMazeRendering);
  const options = [
    {
      value: "0",
      label: "выбрать старт",
      icon: <FiFlag />,
      disabled: isMazeRendering,
    },
    {
      value: "1",
      label: "выбрать конец",
      icon: <FiMapPin />,
      disabled: isMazeRendering,
    },
  ];

  return (
    <ChoiceChips
      isToggle={true}
      options={options}
      onChange={(value) => {
        if (value === options[0].value) setCellSelection("start");
        if (value === options[1].value) setCellSelection("end");
        if (value === null) setCellSelection("none");
      }}
      value={null}
    />
  );
}
