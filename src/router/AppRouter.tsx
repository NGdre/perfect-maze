import { MazeGenerationPanel } from "@components/maze-control/MazeGenerationPanel";
import { PathFindingPanel } from "@components/maze-control/PathFindingPanel";
import { searchParams } from "@constants";
import {
  DEFAULT_DISPLAY_MODE,
  DEFAULT_MAZE_SOLVER_ID,
  algoRegistry,
  generatorNames,
  mazeSolversNames,
} from "@models/algorithm-registry";
import VisualizationPage from "@pages/VisualizationPage";
import { getState } from "@stores";

import { Navigate, createBrowserRouter, redirect } from "react-router";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/visualization/generation" replace />,
  },
  {
    path: "visualization",
    Component: VisualizationPage,
    children: [
      {
        path: "generation",
        Component: MazeGenerationPanel,
        loader: async ({ request }) => {
          const url = new URL(request.url);
          const params = url.searchParams;

          // получаем параметр и значение из store для mazeGenerator
          const mazeGenerator = {
            param: params.get(searchParams.MAZE_GENERATOR),
            fromStore: algoRegistry.getName(
              getState().mazeGenerationAlgorithmId,
            ),
          };

          // если параметр не установлен или содержит некорректное значение, тогда устанавливаем значение из store
          if (
            mazeGenerator.param === null ||
            !generatorNames.includes(mazeGenerator.param)
          ) {
            const newParams = new URLSearchParams(params);

            newParams.set(searchParams.MAZE_GENERATOR, mazeGenerator.fromStore);

            throw redirect(`${url.pathname}?${newParams}`);
          }

          return params;
        },
      },

      {
        path: "path-finding",
        Component: PathFindingPanel,
        loader: async ({ request }) => {
          const url = new URL(request.url);
          const params = url.searchParams;

          // получаем значение для параметра mazeSolver

          const mazeSolver = {
            param: params.get(searchParams.MAZE_SOLVER),
            default: algoRegistry.getName(DEFAULT_MAZE_SOLVER_ID),
          };

          // валидация параметра mazeSolver
          if (
            mazeSolver.param === null ||
            !mazeSolversNames.includes(mazeSolver.param)
          ) {
            const newParams = new URLSearchParams(params);

            newParams.set(searchParams.MAZE_SOLVER, mazeSolver.default);

            throw redirect(`${url.pathname}?${newParams}`);
          }

          const displayMode = {
            param: params.get(searchParams.DISPLAY_MODE),
            default: DEFAULT_DISPLAY_MODE,
          };

          // валидация параметра displayMode
          const mazeSolverId = algoRegistry.getIdByName(mazeSolver.param);
          const displayModes = algoRegistry.getDisplayModes(mazeSolverId);
          const isMazeSolverHasDisplayModes = displayModes.length > 0;

          if (isMazeSolverHasDisplayModes) {
            if (
              displayMode.param === null ||
              !displayModes.includes(displayMode.param)
            ) {
              const newParams = new URLSearchParams(params);

              newParams.set(searchParams.DISPLAY_MODE, displayMode.default);

              throw redirect(`${url.pathname}?${newParams}`);
            }
          } else {
            if (displayMode.param !== null) {
              const newParams = new URLSearchParams(params);

              newParams.delete(searchParams.DISPLAY_MODE);

              throw redirect(`${url.pathname}?${newParams}`);
            }
          }

          return params;
        },
      },
    ],
  },
]);

export default AppRouter;
