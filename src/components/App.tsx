import { useMazeGenerationWarning } from "src/hooks/useMazeGenerationWarning.ts";

import { PROJECT_NAME } from "../constants.ts";
import "./App.css";
import Logo from "./Logo.tsx";
import { Dialog } from "./lib/dialog/Dialog.tsx";
import { useDialog } from "./lib/dialog/useDialog.ts";
import MazeViewport from "./maze-canvas/MazeViewport.tsx";
import MazeControlTabs from "./maze-control/MazeControlTabs.tsx";
import "./resetCSS.css";

function App() {
  const { dialog, showDialog, hideDialog } = useDialog();

  useMazeGenerationWarning(showDialog);

  return (
    <div className="h-screen bg-gray-50 text-text-primary">
      <div className="container mx-auto space-y-10">
        <header>
          <Logo logoText={PROJECT_NAME} />
        </header>
        <main className="flex space-x-10">
          <MazeViewport containerClassName="w-full" />
          <aside className="w-1/4">
            <MazeControlTabs />
          </aside>
        </main>
        {dialog && <Dialog {...dialog} onClose={hideDialog} />}
      </div>
    </div>
  );
}

export default App;
