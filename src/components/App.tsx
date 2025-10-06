import "./resetCSS.css";
import "./App.css";

import { PROJECT_NAME } from "../constants.ts";
import MazeControlTabs from "./maze-control/MazeControlTabs.tsx";
import { MazeCanvasImproved } from "./maze-canvas/MazeCanvas.tsx";
import { Dialog } from "./lib/dialog/Dialog.tsx";
import { useDialog } from "./lib/dialog/useDialog.ts";
import { useMazeGenerationWarning } from "src/hooks/useMazeGenerationWarning.ts";

const classNames = {
  mainContainer: "container mx-auto px-4 flex",
  logoText: "text-3xl font-bold underline",
};

function App() {
  const { dialog, showDialog, hideDialog } = useDialog();

  useMazeGenerationWarning(showDialog);

  return (
    <div className="bg-gray-50">
      <header className="mb-4">
        <h1 className={classNames.logoText}>{PROJECT_NAME}</h1>
      </header>
      <main className={classNames.mainContainer}>
        <div className="left-panel">
          <MazeCanvasImproved />
        </div>
        <div className="right-panel">
          <MazeControlTabs />
        </div>
      </main>
      {dialog && <Dialog {...dialog} onClose={hideDialog} />}
    </div>
  );
}

export default App;
