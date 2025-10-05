import "./tabs.css";
import ResizeForm from "./ResizeForm.tsx";
import MazeGenerationButton from "./MazeGenerationButton.tsx";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import SelectButtons from "../lib/SelectButtons.tsx";
import { useMazeStore } from "@stores/maze-store.ts";
import PathFindingButton from "./PathFindingButton.tsx";
import {
  getSolverIdByAlgoName,
  mazeSolversNames,
  solversInfo,
} from "@solvers/index.ts";
import { generatorNames } from "@generators/index.ts";
import { useTakeStepInSolution } from "@stores/selectors.ts";
import HistoryControls from "./HistoryControls.tsx";

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

export function TabPanelContentForMazeGeneration() {
  const updateMazeGenerator = useMazeStore(
    (state) => state.updateMazeGenerationAlgorithm
  );

  const takeStepInGeneration = useMazeStore(
    (state) => state.takeStepInGeneration
  );

  return (
    <>
      <ResizeForm />
      <h2 className={classNames.headingForAlgoSet}>{headingForGenerators}</h2>
      <SelectButtons
        options={generatorNames}
        onSelect={(option) => option && updateMazeGenerator(option)}
      />
      <MazeGenerationButton />
      <HistoryControls onStep={takeStepInGeneration} />
    </>
  );
}

export function TabPanelContentForPathFinding() {
  const setCellSelection = useMazeStore((state) => state.setCellSelection);
  const setMazeSolverId = useMazeStore((state) => state.setMazeSolverId);
  const mazeSolverId = useMazeStore((state) => state.mazeSolverId);
  const takeStepInSolution = useTakeStepInSolution();

  return (
    <>
      <SelectButtons
        options={["выбрать старт", "выбрать конец"]}
        onSelect={(option) => {
          if (option === "выбрать старт") setCellSelection("start");
          if (option === "выбрать конец") setCellSelection("end");
          if (option === null) setCellSelection("none");
        }}
        togglable={true}
      />
      <h2 className={classNames.headingForAlgoSet}>{headingForPathFinders}</h2>
      <SelectButtons
        options={mazeSolversNames}
        onSelect={(option) => {
          if (option) setMazeSolverId(getSolverIdByAlgoName(option));
        }}
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
  return (
    <Tabs
      selectedTabClassName={classNames.selectedTab}
      className={classNames.tabsComponent}
    >
      <TabList className={classNames.tabList}>
        <Tab className={classNames.tab}>{tabNameForGeneration}</Tab>
        <Tab className={classNames.tab}>{tabNameForPathFinding}</Tab>
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
