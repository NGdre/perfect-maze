import { useContext, useEffect, useRef, useState } from "react";

import { CanvasContext, type CanvasContextType } from "./CanvasLayersContainer";

export type CanvasLayerProps = {
  onRender: (
    ctx: CanvasRenderingContext2D,
    renderWidth: number,
    renderHeight: number,
    dpr: number,
  ) => void | Promise<void> | (() => void);
  className?: string;
  isInteractive?: boolean;
};

export const CanvasLayer = ({
  onRender,
  className,
  isInteractive = false,
}: CanvasLayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { containerWidth, containerHeight, targetAspect } =
    useContext<CanvasContextType>(CanvasContext);

  const [dimensions, setDimensions] = useState({
    renderWidth: 0,
    renderHeight: 0,
    dpr: 1,
  });

  // Calculate aspect ratio and DPR
  useEffect(() => {
    if (!canvasRef.current || containerWidth === 0 || containerHeight === 0)
      return;

    // пока не получается с другими значениями
    // const dpr = window.devicePixelRatio || 1;
    const dpr = 1;

    const containerAspect = containerWidth / containerHeight;

    let renderWidth, renderHeight;

    if (containerAspect > targetAspect) {
      renderHeight = containerHeight;
      renderWidth = renderHeight * targetAspect;
    } else {
      renderWidth = containerWidth;
      renderHeight = renderWidth / targetAspect;
    }

    setDimensions({ renderWidth, renderHeight, dpr });
  }, [containerWidth, containerHeight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onRender) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas physical size and CSS size
    // hack: there's no walls on right side of the maze, so +1 fixes that
    canvas.width = (dimensions.renderWidth + 1) * dimensions.dpr;

    canvas.height = dimensions.renderHeight * dimensions.dpr;
    canvas.style.width = `${dimensions.renderWidth}px`;
    canvas.style.height = `${dimensions.renderHeight}px`;

    // Prevents DPR scaling from compounding on re-renders
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.scale(dimensions.dpr, dimensions.dpr);

    const fn = onRender(
      ctx,
      dimensions.renderWidth,
      dimensions.renderHeight,
      dimensions.dpr,
    );

    if (typeof fn === "function") return () => fn();
  }, [dimensions, onRender]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%)`,
        pointerEvents: isInteractive ? "auto" : "none",
      }}
      className={className}
    />
  );
};
