import { generatorNames } from "@generators/index.ts";
import {
  getSolverIdByAlgoName,
  mazeSolversNames,
  solversInfo,
} from "@solvers/index.ts";
import { MazeMode } from "@stores/index.ts";
import { useMazeStore } from "@stores/maze-store.ts";
import {
  useMazeMode,
  useSetMazeMode,
  useTakeStepInSolution,
} from "@stores/selectors.ts";
import { FiFlag } from "react-icons/fi";
import { FiMapPin } from "react-icons/fi";
import { Tab, TabList, TabPanel, Tabs, TabsProps } from "react-tabs";

import { ChoiceChips } from "../lib/choice-chips/ChoiceChips.tsx";
import HistoryControls from "./HistoryControls.tsx";
import MazeGenerationButton from "./MazeGenerationButton.tsx";
import PathFindingButton from "./PathFindingButton.tsx";
import ResizeForm from "./ResizeForm.tsx";
import "./tabs.css";

const classNames = {
  selectedTab: "tab--selected",
  tabsComponent: "flex flex-col items-center",
  tab: "tab",
  tabList: "tab-list",
  headingForAlgoSet: "mt-5",
};

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
      disabled: true,
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
      <ResizeForm />
      <h2 className={classNames.headingForAlgoSet}>{headingForGenerators}</h2>
      <AlgorithmChoiceChips
        algorithmNames={generatorNames}
        updateAlgoritm={updateMazeGenerator}
      />
      <MazeGenerationButton />
      <HistoryControls onStep={takeStepInGeneration} />
    </>
  );
}

export function TabPanelContentForPathFinding() {
  const setMazeSolverId = useMazeStore((state) => state.setMazeSolverId);
  const mazeSolverId = useMazeStore((state) => state.mazeSolverId);
  const takeStepInSolution = useTakeStepInSolution();

  return (
    <>
      <StartOrEndChoiceChips />
      <h2 className={classNames.headingForAlgoSet}>{headingForPathFinders}</h2>

      <AlgorithmChoiceChips
        algorithmNames={mazeSolversNames}
        updateAlgoritm={(algo) => setMazeSolverId(getSolverIdByAlgoName(algo))}
      />
      {solversInfo[mazeSolverId].features.includes("JumpToFinal") && (
        <PathFindingButton />
      )}
      {solversInfo[mazeSolverId].features.includes("SteppedAlgoExecution") && (
        <HistoryControls onStep={takeStepInSolution} />
      )}
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

  return (
    <Tabs
      selectedTabClassName={classNames.selectedTab}
      selectedIndex={selectedIndex}
      className={classNames.tabsComponent}
      onSelect={handleTabSelect}
    >
      <TabList className={classNames.tabList}>
        <Tab className={classNames.tab} data-maze-mode={MazeMode.generation}>
          {tabNameForGeneration}
        </Tab>
        <Tab className={classNames.tab} data-maze-mode={MazeMode.solving}>
          {tabNameForPathFinding}
        </Tab>
      </TabList>

      <TabPanel>
        <TabPanelContentForMazeGeneration />
      </TabPanel>

      <TabPanel>
        <TabPanelContentForPathFinding />
      </TabPanel>
    </Tabs>
  );
}
