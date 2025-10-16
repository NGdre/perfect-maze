import clsx from "clsx";

import React, { useMemo, useState } from "react";
import { FiLoader } from "react-icons/fi";

import "./button.css";

export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  isLoading?: boolean;
  isToggle?: boolean;
  defaultActive?: boolean;
  active?: boolean;
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement>,
    isActive: boolean,
  ) => void;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
  title?: string;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  isLoading = false,
  isToggle = false,
  defaultActive = false,
  active: controlledActive,
  onClick,
  type = "button",
  ariaLabel,
  title,
  className = "",
  ...rest
}) => {
  const [internalActive, setInternalActive] = useState(defaultActive);

  const isControlled = controlledActive !== undefined;
  const active = isControlled ? controlledActive : internalActive;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;

    let newActiveState = active;

    if (isToggle) {
      newActiveState = !active;
      if (!isControlled) {
        setInternalActive(newActiveState);
      }
    }

    onClick?.(event, newActiveState);
  };

  const buttonClasses = useMemo(() => {
    return clsx(
      "btn",
      `btn--${variant}`,
      `btn--${size}`,
      active && "btn--active",
      disabled && "btn--disabled",
      isLoading && "btn--loading",
      className,
    );
  }, [variant, size, active, disabled, isLoading, className]);

  const hasIcon = useMemo(() => {
    return React.Children.toArray(children).some(
      (child) => React.isValidElement(child) && typeof child.type !== "string",
    );
  }, [children]);

  const renderContent = () => {
    if (isLoading) {
      return <FiLoader className="btn__spinner" aria-hidden="true" />;
    }

    if (hasIcon) {
      return React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && typeof child.type !== "string") {
          return React.cloneElement(child, {
            className: `btn__icon ${child.props.className || ""}`.trim(),
            "aria-hidden": "true",
          });
        }
        return (
          <span key={index} className="btn__text">
            {child}
          </span>
        );
      });
    }

    return <span className="btn__text">{children}</span>;
  };

  const ariaAttributes = useMemo(() => {
    const attrs: Record<string, string | boolean> = {};

    if (ariaLabel) {
      attrs["aria-label"] = ariaLabel;
    }

    if (isToggle) {
      attrs["aria-pressed"] = active;
    }

    if (isLoading) {
      attrs["aria-busy"] = true;
    }

    if (disabled) {
      attrs["aria-disabled"] = true;
    }

    return attrs;
  }, [ariaLabel, isToggle, active, isLoading, disabled]);

  return (
    <div className={clsx(disabled && "cursor-not-allowed")}>
      <button
        type={type}
        className={buttonClasses}
        disabled={disabled || isLoading}
        onClick={handleClick}
        title={title}
        {...ariaAttributes}
        {...rest}
      >
        {renderContent()}
      </button>
    </div>
  );
};

export default Button;
