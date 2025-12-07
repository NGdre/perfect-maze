import { ChangeEvent, FC, FocusEvent, useEffect, useId, useState } from "react";
import React from "react";

import { clamp } from "../../utils";
import "./select-number.css";

const classNames = {
  button:
    "bg-gray-300 text-gray-600 rounded-full outline-none cursor-pointer hover:text-white hover:bg-blue-500",
  buttonSpan: "m-auto text-2xl",
  selectNumberInput: `outline-none focus:outline-none text-center font-semibold 
              hover:text-gray-500 focus:text-black md:text-base flex items-center`,
  selectNumberLabel: "text-gray-700 text-sm font-semibold capitalize",
};

//@ts-ignore
classNames.buttonDisabled = classNames.button + " cursor-not-allowed";

// что-то не так со стилями
const UpdateCountButton = ({
  onClick,
  text,
  disabled,
  ...props
}: {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  text: string;
  disabled: boolean;
}) => {
  return (
    <button
      {...props} // где правильней разместить props?
      onClick={onClick}
      disabled={disabled}
      //@ts-ignore
      className={disabled ? classNames.buttonDisabled : classNames.button}
    >
      {/* нельзя обойтись без span? */}
      <span className={classNames.buttonSpan}>{text}</span>
    </button>
  );
};

export type NumericValue = string | number;

interface SelectNumberProps {
  onSelect: (number: number) => void | Promise<void>;
  value?: NumericValue;
  labelContent?: string;
  min?: NumericValue;
  max?: NumericValue;
  disabled?: boolean;
}

const INCREASE_BTN_TEXT = "+";
const DECREASE_BTN_TEXT = "-";
const STEP = 1;

// компонент раздутый, наверняка с ним что-то не так
const SelectNumber: FC<SelectNumberProps> = ({
  labelContent = "",
  value = 0,
  onSelect,
  min = 0,
  max = 10,
  disabled = false,
  ...props
}) => {
  const [counter, updateCounter] = useState<NumericValue>(+value);
  const [prevValue, setPrevValue] = useState(value);
  const inputId = useId();

  min = +min;
  max = +max;

  const counterAsNumber = +counter;

  if (prevValue !== value) {
    if (value) {
      updateCounter(value);
      setPrevValue(+value);
    }
  }

  // I don't know how to do this without useEffect
  useEffect(() => {
    const maybeNumber = parseInt(String(counter));

    if (Number.isNaN(maybeNumber)) return;

    async function handleSelect() {
      await onSelect(maybeNumber);
    }

    if (maybeNumber <= max && maybeNumber >= min) handleSelect();
  }, [counter]);

  const handleDecrement = () => {
    const incrementedCounter = counterAsNumber - STEP;

    if (incrementedCounter >= min) {
      updateCounter(incrementedCounter);
    }
  };

  const handleIncrement = () => {
    const decrementedCounter = counterAsNumber + STEP;

    if (decrementedCounter <= max) {
      updateCounter(decrementedCounter);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    updateCounter(value);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const { value } = event.target;

    let maybeNumber = parseInt(value, 10);

    if (Number.isNaN(maybeNumber)) {
      maybeNumber = min;
    }

    const clamped = clamp(maybeNumber, min, max);

    updateCounter(clamped);
  };

  return (
    <div className="grid grid-cols-3">
      <div className="col-span-3 text-center">
        <label htmlFor={inputId} className={classNames.selectNumberLabel}>
          {labelContent}
        </label>
      </div>
      <UpdateCountButton
        onClick={handleDecrement}
        text={DECREASE_BTN_TEXT}
        disabled={counterAsNumber <= min || disabled}
      />
      <input
        {...props}
        type="number"
        id={inputId}
        value={counter}
        className={classNames.selectNumberInput}
        onChange={handleChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        disabled={disabled}
      />
      <UpdateCountButton
        onClick={handleIncrement}
        text={INCREASE_BTN_TEXT}
        disabled={counterAsNumber >= max || disabled}
      />
    </div>
  );
};

export default SelectNumber;
