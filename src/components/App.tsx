import { RouterProvider } from "react-router";

import { PROJECT_NAME } from "../constants.ts";
import AppRouter from "../router/AppRouter.tsx";
import "./App.css";
import Logo from "./Logo.tsx";
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
  return (
    <div className="flex min-h-screen flex-col bg-blue-50/50 text-text-primary">
      <Header />
      <RouterProvider router={AppRouter} />
    </div>
  );
}

export default App;
