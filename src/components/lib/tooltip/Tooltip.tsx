import { ComponentProps } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";

type ReactTooltipProps = Omit<ComponentProps<typeof ReactTooltip>, "id">;

interface TooltipProps {
  id?: string;
}

function Tooltip({ id, ...rest }: TooltipProps & ReactTooltipProps) {
  return (
    <ReactTooltip
      id={id}
      className="!rounded !bg-primary-500 !px-2 !py-1 !text-xs !text-white !shadow-lg"
      delayShow={150}
      delayHide={100}
      {...rest}
    />
  );
}

export default Tooltip;
