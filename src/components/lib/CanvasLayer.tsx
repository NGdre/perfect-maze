import { useContext, useEffect, useMemo, useRef } from "react";

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
  preserveState?: boolean;
};

export const CanvasLayer = ({
  onRender,
  className,
  isInteractive = false,
  preserveState = false,
}: CanvasLayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement>();
  const cleanupRef = useRef<(() => void) | void | null>(null);
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

    if (preserveState) {
      if (!offscreenCanvasRef.current || sizeChanged) {
        const newOffscreenCanvas = document.createElement("canvas");
        const offscreenCtx = newOffscreenCanvas.getContext("2d");

        if (offscreenCtx) {
          newOffscreenCanvas.width = renderWidth * dpr;
          newOffscreenCanvas.height = renderHeight * dpr;
          offscreenCtx.scale(dpr, dpr);

          if (offscreenCanvasRef.current && sizeChanged) {
            const oldWidth = offscreenCanvasRef.current.width / dpr;
            const oldHeight = offscreenCanvasRef.current.height / dpr;

            offscreenCtx.drawImage(
              offscreenCanvasRef.current,
              0,
              0,
              oldWidth,
              oldHeight,
              0,
              0,
              renderWidth,
              renderHeight,
            );
          }

          offscreenCanvasRef.current = newOffscreenCanvas;

          if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
          }

          const result = onRender(offscreenCtx, renderWidth, renderHeight, dpr);
          cleanupRef.current = typeof result === "function" ? result : null;
        }
      } else {
        const offscreenCtx = offscreenCanvasRef.current.getContext("2d");

        if (offscreenCtx) {
          if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
          }

          const result = onRender(offscreenCtx, renderWidth, renderHeight, dpr);
          cleanupRef.current = typeof result === "function" ? result : null;
        }
      }

      if (offscreenCanvasRef.current) {
        canvas.width = renderWidth * dpr;
        canvas.height = renderHeight * dpr;
        canvas.style.width = `${renderWidth}px`;
        canvas.style.height = `${renderHeight}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(offscreenCanvasRef.current, 0, 0);
      }
    } else {
      if (sizeChanged) {
        canvas.width = renderWidth * dpr;
        canvas.height = renderHeight * dpr;
        canvas.style.width = `${renderWidth}px`;
        canvas.style.height = `${renderHeight}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }

      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      const result = onRender(ctx, renderWidth, renderHeight, dpr);
      cleanupRef.current = typeof result === "function" ? result : null;
    }

    prevRenderSizeRef.current = {
      width: renderWidth,
      height: renderHeight,
      dpr,
    };
  }, [renderSize, onRender, preserveState]);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      // prevent leaks
      offscreenCanvasRef.current = undefined;
    };
  }, []);

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
