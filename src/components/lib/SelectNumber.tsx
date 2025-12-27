import { clamp } from "@utils";
import clsx from "clsx";

import { ChangeEvent, FC, FocusEvent, ReactNode, useId, useState } from "react";

import Button, { ButtonType } from "./button/Button";
import "./select-number.css";

export type NumericValue = string | number;

interface SelectNumberProps {
  onSelect: (number: number) => void | Promise<void>;
  initialValue?: NumericValue;
  labelContent?: ReactNode;
  decreaseButtonContent?: ReactNode;
  increaseButtonContent?: ReactNode;
  labelClassName?: string;
  min?: NumericValue;
  max?: NumericValue;
  disabled?: boolean;
  buttonProps?: ButtonType;
  step?: number;
}

const SelectNumber: FC<SelectNumberProps> = ({
  labelContent = "",
  decreaseButtonContent,
  increaseButtonContent,
  initialValue = 0,
  onSelect,
  min = 0,
  max = 10,
  disabled = false,
  step = 1,
  buttonProps,
  labelClassName,
  ...props
}) => {
  const [counter, setCounter] = useState<NumericValue>(initialValue);
  const inputId = useId();

  const minNum = +min;
  const maxNum = +max;
  const counterAsNumber = +counter;

  const updateValue = (newValue: number) => {
    if (newValue !== counterAsNumber) {
      setCounter(newValue);
      onSelect(newValue);
    }
  };

  const createNumberUpdater = (newNumber: number) => () => {
    const isValidNumber = minNum <= newNumber && newNumber <= maxNum;

    if (isValidNumber) {
      updateValue(newNumber);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setCounter(value);

    const maybeNumber = parseInt(value, 10);

    if (
      !Number.isNaN(maybeNumber) &&
      maybeNumber >= minNum &&
      maybeNumber <= maxNum
    ) {
      if (maybeNumber !== counterAsNumber) {
        onSelect(maybeNumber);
      }
    }
  };

  const handleInputBlur = (event: FocusEvent<HTMLInputElement>) => {
    const { value } = event.target;

    let maybeNumber = parseInt(value, 10);

    if (Number.isNaN(maybeNumber)) {
      maybeNumber = minNum;
    }

    const clamped = clamp(maybeNumber, minNum, maxNum);
    updateValue(clamped);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <label
        htmlFor={inputId}
        className={clsx(
          "text-sm font-semibold capitalize text-text-primary",
          labelClassName,
        )}
      >
        {labelContent}
      </label>
      <div className="flex">
        <Button
          onClick={createNumberUpdater(counterAsNumber - step)}
          disabled={counterAsNumber <= minNum || disabled}
          size="sm"
          className="rounded-full"
          {...buttonProps}
        >
          {decreaseButtonContent ?? "-"}
        </Button>

        <input
          type="number"
          id={inputId}
          value={counter}
          className={clsx(
            "bg-transparent text-center font-semibold outline-none hover:text-gray-500 focus:text-black focus:outline-none md:text-base",
            disabled && "opacity-30",
          )}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          min={minNum}
          max={maxNum}
          step={step}
          disabled={disabled}
          {...props}
        />

        <Button
          onClick={createNumberUpdater(counterAsNumber + step)}
          disabled={counterAsNumber >= maxNum || disabled}
          size="sm"
          className="rounded-full"
          {...buttonProps}
        >
          {increaseButtonContent ?? "+"}
        </Button>
      </div>
    </div>
  );
};

export default SelectNumber;
