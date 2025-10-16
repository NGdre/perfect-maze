import { VISIALIZATION_ANIMATION_DELAY } from "@constants";
import { useIsMazeRendering, useSetIsMazeRendering } from "@stores/selectors";

import { useEffect } from "react";
import { FiPause, FiPlay } from "react-icons/fi";

import Button, { ButtonProps } from "../lib/button/Button";
import Tooltip from "../lib/tooltip/Tooltip";
import "./play-button.css";

const PlayButton = ({
  onStep,
  ...rest
}: { onStep: () => boolean } & Omit<ButtonProps, "children">) => {
  const isMazeRendering = useIsMazeRendering();
  const setIsMazeRendering = useSetIsMazeRendering();

  useEffect(() => {
    if (!isMazeRendering) return;

    const animationTimer = setInterval(() => {
      const success = onStep();

      if (!success) setIsMazeRendering(false);
    }, VISIALIZATION_ANIMATION_DELAY);

    return () => {
      setIsMazeRendering(false);
      clearInterval(animationTimer);
    };
  }, [isMazeRendering]);

  return (
    <>
      <Button
        onClick={() => {
          setIsMazeRendering(!isMazeRendering);
        }}
        variant="outline"
        isToggle
        active={isMazeRendering}
        className={isMazeRendering ? "rotating-shadow" : ""}
        data-tooltip-id="stop-or-resume-tooltip"
        data-tooltip-content={`${isMazeRendering ? "остановить" : "запустить"} визуализацию`}
        {...rest}
      >
        {isMazeRendering ? <FiPause /> : <FiPlay />}
      </Button>
      <Tooltip id="stop-or-resume-tooltip" />
    </>
  );
};

export default PlayButton;
