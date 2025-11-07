import { MazeMode } from "@models/algorithm-registry";
import { useMazeStore } from "@stores";
import {
  useGenerateMaze,
  useMazeMode,
  useSetMazeMode,
} from "@stores/selectors.ts";
import { DialogConfig } from "src/components/lib/dialog/Dialog";

import { useEffect } from "react";

export function useMazeGenerationWarning(
  showDialog: (config: DialogConfig) => void,
) {
  const isMazeGenerationDone = useMazeStore(
    (state) => state.isMazeGenerationDone,
  );

  const setMazeMode = useSetMazeMode();

  const generateMaze = useGenerateMaze();

  const mazeMode = useMazeMode();

  useEffect(() => {
    if (!isMazeGenerationDone && mazeMode === MazeMode.solving) {
      showDialog({
        title: "Лабиринт не полностью сгенерирован",
        message: "Завершить генерацию автоматически?",
        buttons: [
          {
            text: "Автозавершение",
            variant: "primary",
            onClick: generateMaze,
          },
          {
            text: "Продолжить генерацию",
            variant: "secondary",
            onClick: () => setMazeMode(MazeMode.generation),
          },
        ],
      });
    }
  }, [isMazeGenerationDone, mazeMode, showDialog, generateMaze, setMazeMode]);
}
