import clsx from "clsx";
import { useContext, useEffect, useRef } from "react";
import { LegendContext } from "./LegendGroup";
import { parseSizeValue } from "@utils";

interface LegendRenderOptions {
  ctx: CanvasRenderingContext2D;
}

export interface LegendItemProps {
  readonly name: string;
  namePosition?: "left" | "right" | "top" | "bottom";
  renderWidth?: number | string; // string type is for percentage values
  renderHeight?: number | string; 
  canvasClassName?: string;
  onRender: (options: LegendRenderOptions) => void;
}

const LegendItem = ({
  name,
  namePosition = "right",
  renderWidth = 0,
  renderHeight = 0,
  canvasClassName,
  onRender,
}: LegendItemProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { padding, itemProps, renderOptions, groupWidth, groupHeight } = useContext(LegendContext);

  const widthWithoutPadding = parseSizeValue(
    itemProps?.renderWidth ?? renderWidth,
    groupWidth
  );
  
  const heightWithoutPadding = parseSizeValue(
    itemProps?.renderHeight ?? renderHeight,
    groupHeight
  );

  const canvasSize = {
    width: widthWithoutPadding + padding * 2,
    height: heightWithoutPadding + padding * 2,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.reset();
    ctx.translate(padding, padding);

    onRender({ ctx, ...renderOptions });
  }, [onRender, padding, renderOptions]);

  return (
    <div
      className={clsx(
        "flex items-center gap-3",
        (namePosition === "top" || namePosition === "bottom") && "flex-col !items-start",
      )}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className={canvasClassName}
      />
      <span
        className={clsx(
          "text-lg",
          (namePosition === "left" || namePosition === "top") && "-order-1",
        )}
      >
        {name}
      </span>
    </div>
  );
};

export default LegendItem;