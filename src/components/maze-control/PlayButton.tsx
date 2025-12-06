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

  const isPrevStepFinished = useRef(true);
  const animationFrameRef = useRef<number>();
  const stopRequestedRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMazeRendering) {
      stopRequestedRef.current = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      return;
    }

    stopRequestedRef.current = false;

    let accumulatedTime = 0;
    let previousTime = performance.now();

    const animate = async (currentTime: DOMHighResTimeStamp) => {
      if (
        !isMountedRef.current ||
        !isMazeRendering ||
        stopRequestedRef.current
      ) {
        return;
      }

      const deltaTime = currentTime - previousTime;
      previousTime = currentTime;
      accumulatedTime += deltaTime;

      if (
        accumulatedTime >= VISIALIZATION_ANIMATION_DELAY &&
        isPrevStepFinished.current
      ) {
        isPrevStepFinished.current = false;

        try {
          const success = await onStep();

          if (!isMountedRef.current || stopRequestedRef.current) {
            isPrevStepFinished.current = true;
            return;
          }

          if (!success) {
            setIsMazeRendering(false);
            isPrevStepFinished.current = true;
            return;
          }

          accumulatedTime -= VISIALIZATION_ANIMATION_DELAY;
        } catch (error) {
          console.error("Error in animation step:", error);
          if (isMountedRef.current) {
            setIsMazeRendering(false);
          }
        } finally {
          isPrevStepFinished.current = true;
        }
      }

      if (
        isMountedRef.current &&
        isMazeRendering &&
        !stopRequestedRef.current
      ) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      stopRequestedRef.current = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [isMazeRendering, onStep, setIsMazeRendering]);

  const handleClick = () => {
    if (isMazeRendering) {
      stopRequestedRef.current = true;
    }
    setIsMazeRendering(!isMazeRendering);
  };

  return (
    <>
      <Button
        onClick={handleClick}
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
