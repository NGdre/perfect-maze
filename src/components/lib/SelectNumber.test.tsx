import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SelectNumber from "./SelectNumber";

describe(`${SelectNumber.name} Component`, () => {
  const min = 50,
    max = 200,
    between = 100;

  it("should take a snapshot", () => {
    const { asFragment } = render(
      <SelectNumber
        onSelect={() => {}}
        initialValue={between}
        min={min}
        max={max}
        labelContent="label"
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test(`renders initial count of ${between}`, () => {
    const expected = between;

    render(
      <SelectNumber
        onSelect={() => {}}
        initialValue={expected}
        min={min}
        max={max}
      />,
    );
    const countElement = screen.getByDisplayValue(expected);
    expect(countElement).toBeInTheDocument();
  });

  test("increments count when increment button is clicked", () => {
    const expected = between + 1;

    const onSelect = jest.fn((number) => number);

    render(
      <SelectNumber
        onSelect={onSelect}
        initialValue={between}
        min={min}
        max={max}
      />,
    );

    const incrementButton = screen.getByText(/\+/);
    fireEvent.click(incrementButton);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(expected);
    expect(screen.getByDisplayValue(expected)).toBeInTheDocument();
  });

  test("decrements count when decrement button is clicked", () => {
    const expected = between - 1;

    const onSelect = jest.fn((number) => number);

    render(
      <SelectNumber
        onSelect={onSelect}
        initialValue={between}
        min={min}
        max={max}
      />,
    );

    const decrementButton = screen.getByText(/\-/);
    fireEvent.click(decrementButton);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(expected);
    expect(screen.getByDisplayValue(expected)).toBeInTheDocument();
  });

  test("correctly updates count with multiple clicks", () => {
    const onSelect = jest.fn((number) => number);

    render(
      <SelectNumber
        onSelect={onSelect}
        initialValue={between}
        min={min}
        max={max}
      />,
    );

    const incrementButton = screen.getByText(/\+/);
    const decrementButton = screen.getByText(/\-/);

    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    fireEvent.click(decrementButton);

    expect(onSelect).toHaveBeenCalledTimes(3);
    expect(onSelect.mock.calls[0][0]).toBe(between + 1);
    expect(onSelect.mock.calls[1][0]).toBe(between + 2);
    expect(onSelect.mock.calls[2][0]).toBe(between + 1);
    expect(screen.getByDisplayValue(between + 1)).toBeInTheDocument();
  });

  test("doesn't increment when count equals max value", () => {
    const onSelect = jest.fn();

    render(
      <SelectNumber
        onSelect={onSelect}
        initialValue={max}
        min={min}
        max={max}
      />,
    );

    const incrementButton = screen.getByText(/\+/);
    fireEvent.click(incrementButton);

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue(max)).toBeInTheDocument();
  });

  test("doesn't decrement when count equals min value", () => {
    const onSelect = jest.fn();

    render(
      <SelectNumber
        onSelect={onSelect}
        initialValue={min}
        min={min}
        max={max}
      />,
    );

    const decrementButton = screen.getByText(/\-/);
    fireEvent.click(decrementButton);

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue(min)).toBeInTheDocument();
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
    const defaultValue = between;

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

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(min);
  });
});
