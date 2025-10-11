import { ReactNode } from "react";

import { Heading } from "./Heading";

function MazeControlsHeading({ children }: { children: ReactNode }) {
  return (
    <Heading
      level={2}
      className="mb-4 !text-sm !font-semibold uppercase tracking-wider !text-gray-500"
    >
      {children}
    </Heading>
  );
}

export default MazeControlsHeading;
