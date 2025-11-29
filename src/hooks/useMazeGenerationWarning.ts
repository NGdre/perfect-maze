import { useDialog } from "@components/lib/dialog/useDialog";
import { MazeMode } from "@models/algorithm-registry";
import { useMazeStore } from "@stores";
import {
  useGenerateMaze,
  useMazeMode,
  useSetMazeMode,
} from "@stores/selectors.ts";

import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

export function useMazeGenerationWarning() {
  const { dialog, showDialog, hideDialog } = useDialog();

  const isMazeGenerationDone = useMazeStore(
    (state) => state.isMazeGenerationDone,
  );

  const setMazeMode = useSetMazeMode();

  const generateMaze = useGenerateMaze();

  const mazeMode = useMazeMode();

  const optionSelectedRef = useRef(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isMazeGenerationDone && mazeMode === MazeMode.solving) {
      optionSelectedRef.current = false;

      showDialog({
        title: "Лабиринт не полностью сгенерирован",
        message: "Завершить генерацию автоматически?",
        buttons: [
          {
            text: "Автозавершение",
            variant: "primary",
            onClick: () => {
              optionSelectedRef.current = true;
              generateMaze();
            },
          },
          {
            text: "Продолжить генерацию",
            variant: "secondary",
            onClick: () => {
              optionSelectedRef.current = true;
              setMazeMode(MazeMode.generation);
              navigate("/visualization/generation");
            },
          },
        ],
      });
    }
  }, [isMazeGenerationDone, mazeMode, showDialog, generateMaze, setMazeMode]);

  const handleHideDialog = useCallback(() => {
    if (!optionSelectedRef.current) {
      setMazeMode(MazeMode.generation);
    }
    hideDialog();
  }, [setMazeMode, hideDialog]);

  return {
    dialog,
    hideDialog: handleHideDialog,
  };
}
