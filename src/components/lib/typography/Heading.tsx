import clsx from "clsx";

import { ReactNode } from "react";

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
}

export const Heading = ({ level, children, className = "" }: HeadingProps) => {
  const baseStyles = "font-bold text-gray-900 mb-4";

  const levelStyles = {
    1: "text-4xl md:text-5xl",
    2: "text-3xl md:text-4xl",
    3: "text-2xl md:text-3xl",
    4: "text-xl md:text-2xl",
    5: "text-lg md:text-xl",
    6: "text-base md:text-lg",
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag className={clsx(baseStyles, levelStyles[level], className)}>
      {children}
    </Tag>
  );
};
