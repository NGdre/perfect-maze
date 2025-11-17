import { createContext } from "react";
import { Children } from "react";

import { Heading } from "../typography/Heading";
import { LegendItemProps } from "./LegendItem";
import useResizeObserver from "use-resize-observer";

interface LegendGroupProps {
  groupName?: string;
  padding?: number;
  children: React.ReactNode;
  className?: string;
  itemProps?: Partial<LegendItemProps>;
  renderOptions?: Record<string, any>;
}

export const LegendContext = createContext<
  Required<Pick<LegendGroupProps, "padding" | "itemProps" | "renderOptions">> & {
    groupWidth: number;
    groupHeight: number;
  }
>({
  padding: 0,
  renderOptions: {},
  itemProps: {},
  groupWidth: 0,
  groupHeight: 0,
});

/*
  groups LegendItems and sets common props and renderOptions for them
*/
function LegendGroup({
  padding = 0,
  children,
  className,
  groupName,
  itemProps = {},
  renderOptions = {},
}: LegendGroupProps) {
  const ro = useResizeObserver<HTMLDivElement>();
    
  const ref = ro.ref;
  const groupWidth = ro.width  || 0;
  const groupHeight = ro.height || 0;

  if (Children.count(children) === 0) {
    return null;
  }

  return (
    <div className="space-y-5" ref={ref}>
      <LegendContext.Provider value={{ padding, itemProps, renderOptions, groupWidth, groupHeight }}>
        {groupName && (
          <Heading level={3} className="text-sm font-normal capitalize">
            {groupName}
          </Heading>
        )}
        <div className={className}>{children}</div>
      </LegendContext.Provider>
    </div>
  );
}

export default LegendGroup;
