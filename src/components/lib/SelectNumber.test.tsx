import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SelectNumber from "./SelectNumber";

describe(`${SelectNumber.name} Component`, () => {
  const min = 50,
    max = 200,
    beetween = 100;

  it("should take a snapshot", () => {
    const { asFragment } = render(
      <SelectNumber
        onSelect={() => {}}
        initialValue={beetween}
        min={min}
        max={max}
        labelContent="label"
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test(`renders initial count of ${beetween}`, () => {
    const expected = beetween;

    render(
      <SelectNumber
        onSelect={(number) => {
          expect(number).toBe(expected);
        }}
        initialValue={expected}
        min={min}
        max={max}
      />,
    );
    const countElement = screen.getByDisplayValue(expected);
    expect(countElement).toBeInTheDocument();
  });

  test("increments count when increment button is clicked", () => {
    const expected = beetween + 1;

    const onSelect = jest.fn((number) => number);

    render(
      <SelectNumber
        onSelect={onSelect}
        initialValue={beetween}
        min={min}
        max={max}
      />,
    );

    const incrementButton = screen.getByText(/\+/);
    fireEvent.click(incrementButton);
    const countElement = screen.getByDisplayValue(expected);

    expect(onSelect.mock.calls[1][0]).toBe(expected);
    expect(countElement).toBeInTheDocument();
  });

  test("decrements count when decrement button is clicked", () => {
    const expected = beetween - 1;

    const onSelect = jest.fn((number) => number);

    render(
      <SelectNumber
        onSelect={onSelect}
        initialValue={beetween}
        min={min}
        max={max}
      />,
    );

    const decrementButton = screen.getByText(/\-/);
    fireEvent.click(decrementButton);
    const countElement = screen.getByDisplayValue(expected);

    expect(onSelect.mock.calls[1][0]).toBe(expected);
    expect(countElement).toBeInTheDocument();
  });

  test("correctly updates count with multiple clicks", () => {
    const expected = beetween + 1;

    const onSelect = jest.fn((number) => number);

    render(
      <SelectNumber
        onSelect={onSelect}
        initialValue={beetween}
        min={min}
        max={max}
      />,
    );

    const incrementButton = screen.getByText(/\+/);
    const decrementButton = screen.getByText(/\-/);

    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    fireEvent.click(decrementButton);

    const countElement = screen.getByDisplayValue(expected);

    expect(onSelect.mock.calls[1][0]).toBe(expected);
    expect(countElement).toBeInTheDocument();
  });

  test("doesn't increment when count equals max value", () => {
    render(
      <SelectNumber
        onSelect={(number) => {
          expect(number).toBe(max);
        }}
        initialValue={max}
        min={min}
        max={max}
      />,
    );
    const incrementButton = screen.getByText(/\+/);
    fireEvent.click(incrementButton);
    const countElement = screen.getByDisplayValue(max);
    expect(countElement).toBeInTheDocument();
  });

  test("doesn't decrement when count equals min value", () => {
    render(
      <SelectNumber
        onSelect={(number) => {
          expect(number).toBe(min);
        }}
        initialValue={min}
        min={min}
        max={max}
      />,
    );
    const decrementButton = screen.getByText(/\-/);
    fireEvent.click(decrementButton);
    const countElement = screen.getByDisplayValue(min);
    expect(countElement).toBeInTheDocument();
  });

  test("produces a clamped value on input blur", async () => {
    const onSelect = jest.fn();
    render(
      <SelectNumber
        onSelect={onSelect}
        initialValue={max}
        min={min}
        max={max}
      />,
    );
    const input = screen.getByDisplayValue(max);
    const user = userEvent.setup();

    // Test value below min
    await user.clear(input);
    await user.type(input, "0");
    await user.tab(); // Triggers blur

    expect(onSelect).toHaveBeenLastCalledWith(min);
    expect(screen.getByDisplayValue(min)).toBeInTheDocument();

    // Test value above max
    await user.clear(input);
    await user.type(input, String(max + 1));
    await user.tab();

    expect(onSelect).toHaveBeenLastCalledWith(max);
    expect(screen.getByDisplayValue(max)).toBeInTheDocument();
  });

  test("calls onSelect only when typed correct value", async () => {
    const onSelect = jest.fn((number) => number);
    const defaultValue = beetween;

    render(
      <SelectNumber
        onSelect={onSelect}
        initialValue={defaultValue}
        min={min}
        max={max}
      />,
    );

    const input = screen.getByDisplayValue(defaultValue);

    const user = userEvent.setup();

    await user.clear(input);
    await user.type(input, "0");
    await user.keyboard("[Tab]");

    expect(onSelect.mock.calls[0][0]).toBe(defaultValue);
    expect(onSelect.mock.calls[1][0]).toBe(min);
  });
});
