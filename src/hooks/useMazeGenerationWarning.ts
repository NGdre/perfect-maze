import { DialogConfig } from "@components/lib/dialog/Dialog";
import { MazeMode } from "@models/algorithm-registry";
import { useMazeStore } from "@stores";
import {
  useGenerateMaze,
  useMazeMode,
  useSetMazeMode,
} from "@stores/selectors.ts";

import { useRef } from "react";
import { useNavigate } from "react-router";

export function useMazeGenerationWarning() {
  const isMazeGenerationDone = useMazeStore(
    (state) => state.isMazeGenerationDone,
  );

  const setMazeMode = useSetMazeMode();

  const generateMaze = useGenerateMaze();

  const mazeMode = useMazeMode();

  const optionSelectedRef = useRef(false);

  const navigate = useNavigate();

  const dialogConfig: DialogConfig = {
    title: "Лабиринт не полностью сгенерирован",
    message: "Завершить генерацию автоматически?",
    buttons: [
      {
        text: "Автозавершение",
        variant: "primary",
        onClick: async () => {
          optionSelectedRef.current = true;
          await generateMaze();
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
    onClose: () => {
      if (!optionSelectedRef.current) {
        setMazeMode(MazeMode.generation);
        navigate("/visualization/generation");
      }
      optionSelectedRef.current = false;
    },
  };

  return {
    dialogConfig,
    isOpen: !isMazeGenerationDone && mazeMode === MazeMode.solving,
  };
}
