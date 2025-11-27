import { VISIALIZATION_ANIMATION_DELAY } from "@constants";
import { useIsMazeRendering, useSetIsMazeRendering } from "@stores/selectors";

import { useEffect, useRef } from "react";
import { FiPause, FiPlay } from "react-icons/fi";

import Button, { ButtonProps } from "../lib/button/Button";
import Tooltip from "../lib/tooltip/Tooltip";
import "./play-button.css";

const PlayButton = ({
  onStep,
  ...rest
}: { onStep: () => Promise<boolean> } & Omit<ButtonProps, "children">) => {
  const isMazeRendering = useIsMazeRendering();
  const setIsMazeRendering = useSetIsMazeRendering();

  // this is needed there is always at most one call to onStep at the same time
  const isPrevStepFinished = useRef(true);

  useEffect(() => {
    if (!isMazeRendering) return () => {};

    let animationId: number | undefined;
    let accumulatedTime = 0;
    let previousTime = performance.now();

    const animate = async (currentTime: DOMHighResTimeStamp) => {
      const deltaTime = currentTime - previousTime;
      previousTime = currentTime;
      accumulatedTime += deltaTime;

      if (
        accumulatedTime >= VISIALIZATION_ANIMATION_DELAY &&
        isPrevStepFinished.current
      ) {
        isPrevStepFinished.current = false;

        const success = await onStep();
        if (!success) {
          setIsMazeRendering(false);
          return;
        }
        accumulatedTime = 0;

        isPrevStepFinished.current = true;
      }

      if (isMazeRendering) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      setIsMazeRendering(false);
      if (animationId !== undefined) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isMazeRendering, onStep, setIsMazeRendering]);

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
