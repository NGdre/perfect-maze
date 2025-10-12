import { useMazeGenerationWarning } from "src/hooks/useMazeGenerationWarning.ts";

import { PROJECT_NAME } from "../constants.ts";
import "./App.css";
import Logo from "./Logo.tsx";
import { Dialog } from "./lib/dialog/Dialog.tsx";
import { useDialog } from "./lib/dialog/useDialog.ts";
import MazeViewport from "./maze-canvas/MazeViewport.tsx";
import MazeControlTabs from "./maze-control/MazeControlTabs.tsx";
import "./resetCSS.css";

function Header({ padding }: { padding: number }) {
  return (
    <div className="border-b-2 border-primary-100 bg-bg-primary">
      <header className={`px-${padding} py-3`}>
        <Logo logoText={PROJECT_NAME} />
      </header>
    </div>
  );
}

function App() {
  const { dialog, showDialog, hideDialog } = useDialog();

  useMazeGenerationWarning(showDialog);

  const isSidebarOnTheRight = false;
  const padding = 10;

  return (
    <div className="flex h-screen flex-col bg-blue-50 text-text-primary">
      <Header padding={padding} />
      <div className="flex flex-1">
        <aside
          className={`order-${Number(isSidebarOnTheRight)} w-1/4 max-w-96 border-r border-primary-100 bg-white/60 p-${padding}`}
        >
          <MazeControlTabs />
        </aside>
        <main className={`mx-${padding} flex-1`}>
          <MazeViewport containerClassName="stripes mt-10 !border-primary-100" />
        </main>
      </div>

      {dialog && <Dialog {...dialog} onClose={hideDialog} />}
    </div>
  );
}

export default App;
