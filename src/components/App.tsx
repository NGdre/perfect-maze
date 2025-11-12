import { useMazeGenerationWarning } from "src/hooks/useMazeGenerationWarning.ts";

import { PROJECT_NAME } from "../constants.ts";
import "./App.css";
import Logo from "./Logo.tsx";
import { Dialog } from "./lib/dialog/Dialog.tsx";
import MazeViewport from "./maze-canvas/MazeViewport.tsx";
import MazeControlTabs from "./maze-control/MazeControlTabs.tsx";
import "./resetCSS.css";

function Header() {
  return (
    <div className="w-full border-b-2 border-primary-100 bg-bg-primary">
      <header className="px-between-header-main-sidebar py-3">
        <Logo logoText={PROJECT_NAME} />
      </header>
    </div>
  );
}

function App() {
  const { dialog, hideDialog } = useMazeGenerationWarning();

  const isSidebarOnTheRight = false;

  return (
    <div className="flex min-h-screen flex-col bg-blue-50/50 text-text-primary">
      <Header />

      <div className="flex flex-1 flex-col lg:flex-row">
        <main
          className={`w-full flex-1 px-between-header-main-sidebar ${isSidebarOnTheRight ? "lg:order-1" : "lg:order-2"}`}
        >
          <MazeViewport containerClassName="stripes my-between-header-main-sidebar !border-primary-100" />
        </main>

        <aside
          className={`w-full border-r border-primary-100 bg-blue-25 p-between-header-main-sidebar lg:max-w-[28rem] ${isSidebarOnTheRight ? "lg:order-2" : "lg:order-1"}`}
        >
          <MazeControlTabs />
        </aside>
      </div>

      {dialog && <Dialog {...dialog} onClose={hideDialog} />}
    </div>
  );
}

export default App;
