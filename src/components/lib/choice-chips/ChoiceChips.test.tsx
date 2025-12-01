import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import React from "react";

import { ChipOption, ChoiceChips } from "./ChoiceChips";

const MockIcon = () => <span data-testid="mock-icon"></span>;

const defaultOptions: ChipOption[] = [
  {
    value: "1",
    label: "Option 1",
    icon: <MockIcon />,
  },
  {
    value: "2",
    label: "Option 2",
  },
  {
    value: "3",
    label: "Disabled Option",
    disabled: true,
  },
];

const getEnabledChips = () =>
  screen.getAllByRole("radio").filter((chip) => !chip.hasAttribute("disabled"));

const getChipByValue = (value: string) => screen.getByTestId(`chip-${value}`);

describe("ChoiceChips", () => {
  test("renders all options", () => {
    render(<ChoiceChips options={defaultOptions} />);

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Disabled Option")).toBeInTheDocument();
  });

  test("displays icons when provided", () => {
    render(<ChoiceChips options={defaultOptions} />);

    const icons = screen.getAllByTestId("mock-icon");
    expect(icons).toHaveLength(1);
    expect(icons[0]).toBeInTheDocument();
  });

  test("calls onChange when clicking on a non-selected chip", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<ChoiceChips options={defaultOptions} onChange={handleChange} />);

    await user.click(screen.getByText("Option 1"));
    expect(handleChange).toHaveBeenCalledWith("1");

    await user.click(screen.getByText("Option 2"));
    expect(handleChange).toHaveBeenCalledWith("2");
  });

  test("highlights the selected chip", () => {
    render(<ChoiceChips options={defaultOptions} initialValue="1" />);

    const option1 = getChipByValue("1");
    const option2 = getChipByValue("2");

    expect(option1).toHaveAttribute("data-selected", "true");
    expect(option2).toHaveAttribute("data-selected", "false");
  });

  test("when allowDeselect=true and clicking on non-selected chip, calls onChange with chip value", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <ChoiceChips
        options={defaultOptions}
        onChange={handleChange}
        allowDeselect={true}
      />,
    );

    await user.click(screen.getByText("Option 1"));
    expect(handleChange).toHaveBeenCalledWith("1");
  });

  test("when allowDeselect=true and clicking on selected chip, calls onChange with undefined", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <ChoiceChips
        options={defaultOptions}
        initialValue="1"
        onChange={handleChange}
        allowDeselect={true}
      />,
    );

    await user.click(screen.getByText("Option 1"));
    expect(handleChange).toHaveBeenCalledWith(undefined);
  });

  test("does not deselect when clicking on selected chip with allowDeselect=false", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <ChoiceChips
        options={defaultOptions}
        initialValue="1"
        onChange={handleChange}
        allowDeselect={false}
      />,
    );

    await user.click(screen.getByText("Option 1"));
    expect(handleChange).toHaveBeenCalledWith("1");
  });

  test("does not call onChange when clicking on disabled chip", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<ChoiceChips options={defaultOptions} onChange={handleChange} />);

    const disabledChip = getChipByValue("3");
    await user.click(disabledChip);

    expect(handleChange).not.toHaveBeenCalled();
  });

  test("disabled chip has correct attributes", () => {
    render(<ChoiceChips options={defaultOptions} />);

    const disabledChip = getChipByValue("3");
    expect(disabledChip).toBeDisabled();
    expect(disabledChip).toHaveAttribute("data-disabled", "true");
  });

  test("applies custom className and style", () => {
    const { container } = render(
      <ChoiceChips
        options={defaultOptions}
        className="custom-container"
        style={{ backgroundColor: "red" }}
      />,
    );

    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass("custom-container");
    expect(containerElement).toHaveStyle("background-color: red");
  });

  test("applies custom chipClassName and chipStyle", () => {
    render(
      <ChoiceChips
        options={defaultOptions}
        chipClassName="custom-chip"
        chipStyle={{ color: "blue" }}
      />,
    );

    const chip = getChipByValue("1");
    expect(chip).toHaveClass("custom-chip");
    expect(chip).toHaveStyle("color: blue");
  });

  test("supports keyboard navigation between enabled chips", async () => {
    const user = userEvent.setup();
    render(<ChoiceChips options={defaultOptions} />);

    const enabledChips = getEnabledChips();
    expect(enabledChips).toHaveLength(2);

    // Focus first enabled chip via Tab
    await user.tab();
    expect(enabledChips[0]).toHaveFocus();
    expect(enabledChips[0]).toHaveAttribute("data-focused", "true");

    // Navigate to next enabled chip with ArrowRight
    await user.keyboard("{ArrowRight}");
    expect(enabledChips[1]).toHaveFocus();
    expect(enabledChips[1]).toHaveAttribute("data-focused", "true");
    expect(enabledChips[0]).toHaveAttribute("data-focused", "false");

    // Navigate back with ArrowLeft
    await user.keyboard("{ArrowLeft}");
    expect(enabledChips[0]).toHaveFocus();
    expect(enabledChips[0]).toHaveAttribute("data-focused", "true");
    expect(enabledChips[1]).toHaveAttribute("data-focused", "false");
  });

  test("keyboard navigation cycles and skips disabled chips", async () => {
    const user = userEvent.setup();
    render(<ChoiceChips options={defaultOptions} />);

    const enabledChips = getEnabledChips();
    expect(enabledChips).toHaveLength(2);

    // Focus first enabled chip
    await user.tab();
    expect(enabledChips[0]).toHaveFocus();

    // Navigate to next enabled chip
    await user.keyboard("{ArrowRight}");
    expect(enabledChips[1]).toHaveFocus();

    // Navigate from last enabled chip to first (cycle)
    await user.keyboard("{ArrowRight}");
    expect(enabledChips[0]).toHaveFocus();

    // Navigate from first chip to last enabled (cycle)
    await user.keyboard("{ArrowLeft}");
    expect(enabledChips[1]).toHaveFocus();
  });

  test("disabled chips do not receive focus during navigation", async () => {
    const user = userEvent.setup();
    render(<ChoiceChips options={defaultOptions} />);

    const disabledChip = getChipByValue("3");
    const enabledChips = getEnabledChips();

    // Focus first enabled chip
    await user.tab();
    expect(enabledChips[0]).toHaveFocus();

    // Navigate to next enabled chip (skipping disabled)
    await user.keyboard("{ArrowRight}");
    expect(enabledChips[1]).toHaveFocus();
    expect(disabledChip).not.toHaveFocus();

    // Another ArrowRight - should cycle back to first enabled chip
    await user.keyboard("{ArrowRight}");
    expect(enabledChips[0]).toHaveFocus();
    expect(disabledChip).not.toHaveFocus();
  });

  test("has correct ARIA attributes", () => {
    render(<ChoiceChips options={defaultOptions} initialValue="1" />);

    const container = screen.getByRole("radiogroup");
    expect(container).toBeInTheDocument();

    const chips = screen.getAllByRole("radio");
    expect(chips).toHaveLength(3);

    const selectedChip = getChipByValue("1");
    expect(selectedChip).toHaveAttribute("aria-checked", "true");

    const unselectedChip = getChipByValue("2");
    expect(unselectedChip).toHaveAttribute("aria-checked", "false");
  });

  test("handles focus and blur correctly", async () => {
    const user = userEvent.setup();
    render(<ChoiceChips options={defaultOptions} />);

    const option1 = screen.getByTestId("chip-1");

    await user.tab();
    expect(option1).toHaveFocus();
    expect(option1).toHaveAttribute("data-focused", "true");

    await user.tab();
    expect(option1).not.toHaveFocus();
    // After blur, focusedIndex becomes -1, so data-focused="false"
    expect(option1).toHaveAttribute("data-focused", "false");
  });

  test("handles empty options array", () => {
    render(<ChoiceChips options={[]} />);

    const chips = screen.queryAllByRole("radio");
    expect(chips).toHaveLength(0);
  });

  test("deselects when clicking on selected chip with allowDeselect=true", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <ChoiceChips
        options={defaultOptions}
        initialValue="1"
        onChange={handleChange}
        allowDeselect={true}
      />,
    );

    const option1 = getChipByValue("1");
    expect(option1).toHaveAttribute("data-selected", "true");

    // Click on selected chip - should deselect
    await user.click(screen.getByText("Option 1"));

    // Check that chip is no longer selected
    expect(option1).toHaveAttribute("data-selected", "false");
    // onChange should be called with undefined when deselecting
    expect(handleChange).toHaveBeenCalledWith(undefined);
  });

  test("toggle functionality works correctly", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <ChoiceChips
        options={defaultOptions}
        onChange={handleChange}
        allowDeselect={true}
      />,
    );

    const option1 = screen.getByText("Option 1").closest("button");
    const option2 = screen.getByText("Option 2").closest("button");

    // Select Option 1
    await user.click(screen.getByText("Option 1"));
    expect(option1).toHaveAttribute("data-selected", "true");
    expect(handleChange).toHaveBeenCalledWith("1");
    handleChange.mockClear();

    // Click again - should deselect
    await user.click(screen.getByText("Option 1"));
    expect(option1).toHaveAttribute("data-selected", "false");
    // onChange should be called with undefined when deselecting
    expect(handleChange).toHaveBeenCalledWith(undefined);
    handleChange.mockClear();

    // Select Option 2
    await user.click(screen.getByText("Option 2"));
    expect(option2).toHaveAttribute("data-selected", "true");
    expect(handleChange).toHaveBeenCalledWith("2");
    handleChange.mockClear();

    // Click on Option 1 - should switch selection
    await user.click(screen.getByText("Option 1"));
    expect(option1).toHaveAttribute("data-selected", "true");
    expect(option2).toHaveAttribute("data-selected", "false");
    expect(handleChange).toHaveBeenCalledWith("1");
  });

  test("toggle functionality calls onChange with correct values", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    // Test selecting a non-selected chip
    const { rerender } = render(
      <ChoiceChips
        options={defaultOptions}
        onChange={handleChange}
        allowDeselect={true}
      />,
    );

    // Select Option 1
    await user.click(screen.getByText("Option 1"));
    expect(handleChange).toHaveBeenCalledWith("1");
    handleChange.mockClear();

    // Test deselecting selected chip
    rerender(
      <ChoiceChips
        options={defaultOptions}
        initialValue="1"
        onChange={handleChange}
        allowDeselect={true}
      />,
    );

    // Click on selected Option 1 - should deselect
    await user.click(screen.getByText("Option 1"));
    // onChange should be called with undefined when deselecting
    expect(handleChange).toHaveBeenCalledWith(undefined);
    handleChange.mockClear();

    // Select Option 2
    rerender(
      <ChoiceChips
        options={defaultOptions}
        onChange={handleChange}
        allowDeselect={true}
      />,
    );

    await user.click(screen.getByText("Option 2"));
    expect(handleChange).toHaveBeenCalledWith("2");
  });

  test("does not call onChange when initialValue is undefined and no chip is selected", () => {
    const handleChange = jest.fn();
    render(<ChoiceChips options={defaultOptions} onChange={handleChange} />);

    // No interaction, so onChange should not be called
    expect(handleChange).not.toHaveBeenCalled();
  });

  test("maintains internal state when onChange is not provided", async () => {
    const user = userEvent.setup();
    render(<ChoiceChips options={defaultOptions} allowDeselect={true} />);

    const option1 = getChipByValue("1");

    // Click to select
    await user.click(screen.getByText("Option 1"));
    expect(option1).toHaveAttribute("data-selected", "true");

    // Click again to deselect
    await user.click(screen.getByText("Option 1"));
    expect(option1).toHaveAttribute("data-selected", "false");
  });
});
