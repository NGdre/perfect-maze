import { RouterProvider } from "react-router";

import AppRouter from "../router/AppRouter.tsx";
import "./App.css";
import "./resetCSS.css";

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-blue-50/50 text-text-primary">
      <RouterProvider router={AppRouter} />
    </div>
  );
}

export default App;
