import { createContext } from "react";
import { Children } from "react";

import { Heading } from "../typography/Heading";
import { LegendItemProps } from "./LegendItem";

interface LegendGroupProps {
  groupName?: string;
  padding?: number;
  children: React.ReactNode;
  className?: string;
  itemProps?: Partial<LegendItemProps>;
  renderOptions?: Record<string, any>;
}

export const LegendContext = createContext<
  Required<Pick<LegendGroupProps, "padding" | "itemProps" | "renderOptions">>
>({
  padding: 0,
  renderOptions: {},
  itemProps: {},
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
  if (Children.count(children) === 0) {
    return null;
  }

  return (
    <div className="space-y-5">
      <LegendContext.Provider value={{ padding, itemProps, renderOptions }}>
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
