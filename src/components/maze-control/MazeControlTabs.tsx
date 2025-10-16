import { generatorNames } from "@generators";
import { getSolverIdByAlgoName, mazeSolversNames, solversInfo } from "@solvers";
import { MazeMode, useMazeStore } from "@stores";
import {
  useMazeMode,
  useSetMazeMode,
  useTakeStepInSolution,
} from "@stores/selectors.ts";

import { FiFlag, FiMapPin } from "react-icons/fi";
import { Tab, TabList, TabPanel, Tabs, TabsProps } from "react-tabs";

import { ChoiceChips } from "../lib/choice-chips/ChoiceChips.tsx";
import MazeControlsHeading from "../lib/typography/MazeControlsHeading.tsx";
import HistoryControls from "./HistoryControls.tsx";
import MazeGenerationButton from "./MazeGenerationButton.tsx";
import PathFindingButton from "./PathFindingButton.tsx";

const tabNameForGeneration = "Генерация";
const tabNameForPathFinding = "Нахождение пути";
const headingForGenerators = "Алгоритмы";
const headingForPathFinders = "Алгоритмы";

/*
  Возможно текущий код не удовлетворяет SRP.
  Оба TabPanel независимые компоненты, а значит должны быть отделены
  Если h2 нужно поменять на h3, то придется менять код в двух местах.
  TabList зависит от контента в TabPanel, поэтому его не нужно отделять
*/

function AlgorithmChoiceChips<T extends string>({
  algorithmNames,
  updateAlgoritm,
}: {
  algorithmNames: T[];
  updateAlgoritm: (algorithm: T) => void;
}) {
  return (
    <ChoiceChips
      options={algorithmNames.map((label, i) => ({
        value: String(i),
        label,
      }))}
      onChange={(index) => index && updateAlgoritm(algorithmNames[+index])}
    />
  );
}

function StartOrEndChoiceChips() {
  const setCellSelection = useMazeStore((state) => state.setCellSelection);
  const options = [
    {
      value: "0",
      label: "выбрать старт",
      icon: <FiFlag />,
    },
    {
      value: "1",
      label: "выбрать конец",
      icon: <FiMapPin />,
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

export function TabPanelContentForMazeGeneration() {
  const updateMazeGenerator = useMazeStore(
    (state) => state.updateMazeGenerationAlgorithm,
  );

  const takeStepInGeneration = useMazeStore(
    (state) => state.takeStepInGeneration,
  );

  return (
    <>
      <MazeGenerationButton />
      <HistoryControls onStep={takeStepInGeneration} />
      <MazeControlsHeading>{headingForGenerators}</MazeControlsHeading>
      <AlgorithmChoiceChips
        algorithmNames={generatorNames}
        updateAlgoritm={updateMazeGenerator}
      />
    </>
  );
}

export function TabPanelContentForPathFinding() {
  const setMazeSolverId = useMazeStore((state) => state.setMazeSolverId);
  const mazeSolverId = useMazeStore((state) => state.mazeSolverId);
  const takeStepInSolution = useTakeStepInSolution();

  return (
    <>
      {solversInfo[mazeSolverId].features.includes("JumpToFinal") && (
        <PathFindingButton />
      )}
      {solversInfo[mazeSolverId].features.includes("SteppedAlgoExecution") && (
        <HistoryControls onStep={takeStepInSolution} />
      )}

      <StartOrEndChoiceChips />

      <MazeControlsHeading>{headingForPathFinders}</MazeControlsHeading>

      <AlgorithmChoiceChips
        algorithmNames={mazeSolversNames}
        updateAlgoritm={(algo) => setMazeSolverId(getSolverIdByAlgoName(algo))}
      />
    </>
  );
}

export default function MazeControlTabs() {
  const setMazeMode = useSetMazeMode();
  const mazeMode = useMazeMode();

  const handleTabSelect: TabsProps["onSelect"] = (
    _index,
    _lastIndex,
    event,
  ) => {
    const tabElement = event.target as HTMLElement;
    const mazeMode = tabElement.dataset.mazeMode;

    if (mazeMode) setMazeMode(mazeMode as MazeMode);
  };

  const selectedIndex = mazeMode === MazeMode.generation ? 0 : 1;

  const tabClassName = `hover:text-primary-500 border-b-2 transition-all border-transparent
     py-4 text-sm font-semibold cursor-pointer
     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-opacity-50 
     flex-1 text-center min-w-0 capitalize tracking-wider`;

  const tabPanelClassName = "space-y-5";
  return (
    <Tabs
      selectedTabClassName="!border-primary-500 text-primary-500 font-bold"
      selectedIndex={selectedIndex}
      onSelect={handleTabSelect}
    >
      <MazeControlsHeading>управление</MazeControlsHeading>

      <TabList className="mb-5 flex border-b border-gray-400">
        <Tab className={tabClassName} data-maze-mode={MazeMode.generation}>
          {tabNameForGeneration}
        </Tab>
        <Tab className={tabClassName} data-maze-mode={MazeMode.solving}>
          {tabNameForPathFinding}
        </Tab>
      </TabList>

      <TabPanel className={tabPanelClassName}>
        <TabPanelContentForMazeGeneration />
      </TabPanel>

      <TabPanel className={tabPanelClassName}>
        <TabPanelContentForPathFinding />
      </TabPanel>
    </Tabs>
  );
}
