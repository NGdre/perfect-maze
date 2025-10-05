import { useEffect } from "react";
import { useIsMazeRendering, useSetIsMazeRendering } from "@stores/selectors";
import { VISIALIZATION_ANIMATION_DELAY } from "@constants";

const buttonText = {
  STOP: "остановить",
  RESUME: "запустить",
};

const StopOrResumeButton = ({ onStep }: { onStep: () => boolean }) => {
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
    <button
      onClick={() => {
        setIsMazeRendering(!isMazeRendering);
      }}
    >
      {isMazeRendering ? buttonText.STOP : buttonText.RESUME}
    </button>
  );
};

export default StopOrResumeButton;
