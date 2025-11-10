import { useContext, useEffect, useRef } from "react";

import { LegendContext } from "./LegendGroup";

interface LegendRenderOptions {
  ctx: CanvasRenderingContext2D;
}

export interface LegendItemProps {
  readonly name: string;
  renderWidth?: number;
  renderHeight?: number;
  canvasClassName?: string;
  onRender: (options: LegendRenderOptions) => void;
}

const LegendItem = ({
  name,
  renderWidth = 0,
  renderHeight = 0,
  canvasClassName,
  onRender,
}: LegendItemProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { padding, itemProps, renderOptions } = useContext(LegendContext);

  const canvasSize = {
    width: (itemProps?.renderWidth || renderWidth) + padding * 2,
    height: (itemProps?.renderHeight || renderHeight) + padding * 2,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.reset();
    ctx.translate(padding, padding);

    onRender({ ctx, ...renderOptions });
  }, [onRender]);

  return (
    <div className="flex items-center gap-3">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className={canvasClassName}
      />
      <span className="text-lg">{name}</span>
    </div>
  );
};

export default LegendItem;
