import { MazeMode, MazeModeType } from "@models/algorithm-registry.ts";
import { useMazeMode, useSetMazeMode } from "@stores/selectors.ts";

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Tab, TabList, TabPanel, Tabs, TabsProps } from "react-tabs";

import { useMazeGenerationWarning } from "../../hooks/useMazeGenerationWarning.ts";
import { Dialog } from "../lib/dialog/Dialog.tsx";
import MazeControlsHeading from "../lib/typography/MazeControlsHeading.tsx";
import MazeLegend from "../maze-legend/MazeLegend.tsx";
import DisplayModes from "./DisplayModes.tsx";
import { MazeGenerationPanel } from "./MazeGenerationPanel.tsx";
import { PathFindingPanel } from "./PathFindingPanel.tsx";

const tabNameForGeneration = "Генерация";
const tabNameForPathFinding = "Нахождение пути";

export default function MazeControlTabs() {
  const setMazeMode = useSetMazeMode();
  const mazeMode = useMazeMode();

  const location = useLocation();
  const navigate = useNavigate();

  const routes = ["generation", "path-finding"];

  const { dialogConfig, isOpen } = useMazeGenerationWarning();

  const handleTabSelect: TabsProps["onSelect"] = (
    _index,
    _lastIndex,
    event,
  ) => {
    const tabElement = event.target as HTMLElement;
    const mazeMode = tabElement.dataset.mazeMode;

    if (mazeMode) {
      setMazeMode(mazeMode as MazeModeType);

      const selectedIndex = mazeMode === MazeMode.generation ? 0 : 1;

      navigate("/visualization/" + routes[selectedIndex]);
    }
  };

  useEffect(() => {
    switch (location.pathname) {
      case "/visualization/generation":
        setMazeMode(MazeMode.generation);
        break;
      case "/visualization/path-finding":
        setMazeMode(MazeMode.solving);
        break;
      default:
        setMazeMode(MazeMode.generation);
    }
  }, [location, mazeMode]);

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

      <TabList className="mb-10 flex border-b border-gray-400">
        <Tab className={tabClassName} data-maze-mode={MazeMode.generation}>
          {tabNameForGeneration}
        </Tab>
        <Tab className={tabClassName} data-maze-mode={MazeMode.solving}>
          {tabNameForPathFinding}
        </Tab>
      </TabList>

      <TabPanel className={tabPanelClassName}>
        <MazeGenerationPanel />
      </TabPanel>

      <TabPanel className={tabPanelClassName}>
        <PathFindingPanel />
      </TabPanel>

      <DisplayModes />
      <MazeLegend />

      <Dialog {...dialogConfig} isOpen={isOpen} />
    </Tabs>
  );
}
