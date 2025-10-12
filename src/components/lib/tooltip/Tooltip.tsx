import { Tooltip as ReactTooltip } from "react-tooltip";

function Tooltip({ id }: { id?: string }) {
  return (
    <ReactTooltip
      id={id}
      className="!rounded !px-2 !py-1 !text-xs !text-white !shadow-lg"
      variant="info"
      delayShow={500}
      delayHide={200}
    />
  );
}

export default Tooltip;
