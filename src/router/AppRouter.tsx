import Layout from "@components/Layout";
import { MazeGenerationPanel } from "@components/maze-control/MazeGenerationPanel";
import { PathFindingPanel } from "@components/maze-control/PathFindingPanel";
import { pathSegments, routes } from "@constants";
import NotFound from "@pages/NotFound";
import VisualizationPage from "@pages/VisualizationPage";

import { Navigate, createBrowserRouter } from "react-router";

import { mazeGenerationLoader, pathFindingLoader } from "./loaders";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        element: <Navigate to={routes.generation} replace />,
      },
      {
        path: pathSegments.visualization,
        Component: VisualizationPage,
        children: [
          {
            path: pathSegments.generation,
            Component: MazeGenerationPanel,
            loader: mazeGenerationLoader,
          },
          {
            path: pathSegments["path-finding"],
            Component: PathFindingPanel,
            loader: pathFindingLoader,
          },
        ],
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);

export default AppRouter;
