import clsx from "clsx";

import React, { useCallback, useEffect, useRef, useState } from "react";

export interface ChipOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface ChoiceChipsProps {
  options: ChipOption[];
  value?: string | null;
  onChange?: (value: string | null) => void;
  isToggle?: boolean;
  className?: string;
  chipClassName?: string;
  style?: React.CSSProperties;
  chipStyle?: React.CSSProperties;
}

export const ChoiceChips: React.FC<ChoiceChipsProps> = ({
  options,
  value = "0",
  onChange,
  isToggle = false,
  className = "",
  chipClassName = "",
  style,
  chipStyle,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [internalValue, setInternalValue] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleClick = useCallback(
    (option: ChipOption, index: number) => {
      if (option.disabled) return;

      let newValue: string | null = option.value;

      if (isToggle) {
        newValue = internalValue === option.value ? null : option.value;
      }

      setInternalValue(newValue);
      onChange?.(newValue);
      setFocusedIndex(index);
    },
    [internalValue, isToggle, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!containerRef.current) return;

      const enabledChips = Array.from(
        containerRef.current.querySelectorAll(
          'button[role="radio"]:not([disabled])',
        ),
      ) as HTMLElement[];

      if (enabledChips.length === 0) return;

      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const direction = e.key === "ArrowRight" ? 1 : -1;

        const currentIndex = enabledChips.findIndex(
          (chip) => chip === document.activeElement,
        );
        let nextIndex = currentIndex + direction;

        // Циклическая навигация
        if (nextIndex >= enabledChips.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = enabledChips.length - 1;

        enabledChips[nextIndex]?.focus();

        const nextChipValue =
          enabledChips[nextIndex].getAttribute("data-value");
        const optionIndex = options.findIndex(
          (opt) => opt.value === nextChipValue,
        );
        setFocusedIndex(optionIndex);
      }
    },
    [options],
  );

  return (
    <div
      ref={containerRef}
      className={clsx("flex flex-wrap gap-2 p-1", className)}
      style={style}
      onKeyDown={handleKeyDown}
      role="radiogroup"
    >
      {options.map((option, index) => {
        const isSelected = internalValue === option.value;
        const isFocused = focusedIndex === index;

        return (
          <button
            key={option.value}
            className={clsx(
              "inline-flex min-h-8 items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 capitalize outline-none transition-all duration-200",
              !option.disabled && [
                "cursor-pointer",
                "hover:bg-primary-500 hover:text-white",
                "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                isSelected && "!border-primary-500 bg-blue-50 text-primary-700",
              ],
              option.disabled && "cursor-not-allowed opacity-40",
              chipClassName,
            )}
            style={chipStyle}
            onClick={() => handleClick(option, index)}
            onFocus={() => !option.disabled && setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(-1)}
            disabled={option.disabled}
            role="radio"
            aria-checked={isSelected}
            type="button"
            data-value={option.value}
            data-testid={`chip-${option.value}`}
            data-selected={isSelected}
            data-focused={isFocused}
            data-disabled={option.disabled}
          >
            {option.icon && (
              <span className="flex items-center text-lg">{option.icon}</span>
            )}
            <span className="whitespace-nowrap text-sm font-medium">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
