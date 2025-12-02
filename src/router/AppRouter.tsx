import VisualizationPage from "src/pages/VisualizationPage";

import { Navigate, createBrowserRouter } from "react-router";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/visualization/generation" replace />,
  },
  {
    path: "/visualization/generation",
    element: <VisualizationPage />,
  },
  {
    path: "/visualization/path-finding",
    element: <VisualizationPage />,
  },
]);

export default AppRouter;
