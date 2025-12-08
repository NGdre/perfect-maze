import { clamp } from "@utils";
import clsx from "clsx";

import {
  ChangeEvent,
  FC,
  FocusEvent,
  ReactNode,
  useEffect,
  useId,
  useState,
} from "react";

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
  const [counter, updateCounter] = useState<NumericValue>(initialValue);
  const inputId = useId();

  min = +min;
  max = +max;

  const counterAsNumber = +counter;

  useEffect(() => {
    const maybeNumber = parseInt(String(counter));

    if (Number.isNaN(maybeNumber)) return;

    async function handleSelect() {
      await onSelect(maybeNumber);
    }

    if (maybeNumber <= max && maybeNumber >= min) handleSelect();
  }, [counter]);

  const createNumberUpdater = (newNumber: number) => () => {
    const isValidNumber = min <= newNumber && newNumber <= max;

    if (isValidNumber) {
      updateCounter(newNumber);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    updateCounter(value);
  };

  const handleInputBlur = (event: FocusEvent<HTMLInputElement>) => {
    const { value } = event.target;

    let maybeNumber = parseInt(value, 10);

    if (Number.isNaN(maybeNumber)) {
      maybeNumber = min;
    }

    const clamped = clamp(maybeNumber, min, max);

    updateCounter(clamped);
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
          disabled={counterAsNumber <= min || disabled}
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
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          {...props}
        />

        <Button
          onClick={createNumberUpdater(counterAsNumber + step)}
          disabled={counterAsNumber >= max || disabled}
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
