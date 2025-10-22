import { useContext, useEffect, useMemo, useRef } from "react";

import { CanvasContext, type CanvasContextType } from "./CanvasLayersContainer";

export type CanvasLayerProps = {
  onRender: (
    ctx: CanvasRenderingContext2D,
    renderWidth: number,
    renderHeight: number,
    dpr: number,
    isResized: boolean,
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
  const prevRenderSizeRef = useRef<{
    width: number;
    height: number;
    dpr: number;
  }>();

  const { containerWidth, containerHeight, targetAspect } =
    useContext<CanvasContextType>(CanvasContext);

  const renderSize = useMemo(() => {
    if (containerWidth === 0 || containerHeight === 0) return null;

    const dpr = window.devicePixelRatio || 1;
    const containerAspect = containerWidth / containerHeight;

    let renderWidth, renderHeight;

    if (containerAspect > targetAspect) {
      renderHeight = containerHeight;
      renderWidth = renderHeight * targetAspect;
    } else {
      renderWidth = containerWidth;
      renderHeight = renderWidth / targetAspect;
    }

    renderWidth = Math.floor(renderWidth);
    renderHeight = Math.floor(renderHeight);

    return { renderWidth, renderHeight, dpr };
  }, [containerWidth, containerHeight, targetAspect]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !renderSize) return;

    const { renderWidth, renderHeight, dpr } = renderSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prevSize = prevRenderSizeRef.current;

    const sizeChanged =
      !prevSize ||
      prevSize.width !== renderWidth ||
      prevSize.height !== renderHeight ||
      prevSize.dpr !== dpr;

    if (sizeChanged) {
      canvas.width = renderWidth * dpr;
      canvas.height = renderHeight * dpr;
      canvas.style.width = `${renderWidth}px`;
      canvas.style.height = `${renderHeight}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    const result = onRender(ctx, renderWidth, renderHeight, dpr, sizeChanged);
    const cleanup = typeof result === "function" ? result : null;

    prevRenderSizeRef.current = {
      width: renderWidth,
      height: renderHeight,
      dpr,
    };

    return () => {
      cleanup?.();
    };
  }, [renderSize, onRender]);

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
