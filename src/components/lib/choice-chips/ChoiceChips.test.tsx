import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

//@ts-ignore
import React from "react";

import { ChipOption, ChoiceChips } from "./ChoiceChips";

const MockIcon = () => <span data-testid="mock-icon">📱</span>;

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
  test("рендерит все опции", () => {
    render(<ChoiceChips options={defaultOptions} />);

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Disabled Option")).toBeInTheDocument();
  });

  test("отображает иконки когда они предоставлены", () => {
    render(<ChoiceChips options={defaultOptions} />);

    const icons = screen.getAllByTestId("mock-icon");
    expect(icons).toHaveLength(1);
    expect(icons[0]).toBeInTheDocument();
  });

  test("вызывает onChange при клике на неактивную кнопку", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<ChoiceChips options={defaultOptions} onChange={handleChange} />);

    await user.click(screen.getByText("Option 1"));
    expect(handleChange).toHaveBeenCalledWith("1");

    await user.click(screen.getByText("Option 2"));
    expect(handleChange).toHaveBeenCalledWith("2");
  });

  test("выделяет активную кнопку", () => {
    render(<ChoiceChips options={defaultOptions} value="1" />);

    const option1 = getChipByValue("1");
    const option2 = getChipByValue("2");

    expect(option1).toHaveAttribute("data-selected", "true");
    expect(option2).toHaveAttribute("data-selected", "false");
  });

  test("при isToggle=true и неактивной кнопке вызывает onChange со значением кнопки", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <ChoiceChips
        options={defaultOptions}
        value={null}
        onChange={handleChange}
        isToggle={true}
      />,
    );

    await user.click(screen.getByText("Option 1"));
    expect(handleChange).toHaveBeenCalledWith("1");
  });

  test("при isToggle=true и активной кнопке вызывает onChange с null", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <ChoiceChips
        options={defaultOptions}
        value="1"
        onChange={handleChange}
        isToggle={true}
      />,
    );

    await user.click(screen.getByText("Option 1"));
    expect(handleChange).toHaveBeenCalledWith(null);
  });

  test("не сбрасывает выбор при клике на активную кнопку когда isToggle=false", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <ChoiceChips
        options={defaultOptions}
        value="1"
        onChange={handleChange}
        isToggle={false}
      />,
    );

    await user.click(screen.getByText("Option 1"));
    expect(handleChange).toHaveBeenCalledWith("1");
  });

  test("не вызывает onChange при клике на disabled кнопку", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<ChoiceChips options={defaultOptions} onChange={handleChange} />);

    const disabledChip = getChipByValue("3");
    await user.click(disabledChip);

    expect(handleChange).not.toHaveBeenCalled();
  });

  test("disabled кнопка имеет правильные атрибуты", () => {
    render(<ChoiceChips options={defaultOptions} />);

    const disabledChip = getChipByValue("3");
    expect(disabledChip).toBeDisabled();
    expect(disabledChip).toHaveAttribute("data-disabled", "true");
  });

  test("применяет custom className и style", () => {
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

  test("применяет custom chipClassName и chipStyle", () => {
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

  // Исправленные тесты для клавиатурной навигации

  test("поддерживает клавиатурную навигацию между enabled кнопками", async () => {
    const user = userEvent.setup();
    render(<ChoiceChips options={defaultOptions} />);

    const enabledChips = getEnabledChips();
    expect(enabledChips).toHaveLength(2); // Проверим, что действительно 2 enabled кнопки

    // Фокусируем первую enabled кнопку через Tab
    await user.tab();
    expect(enabledChips[0]).toHaveFocus();
    expect(enabledChips[0]).toHaveAttribute("data-focused", "true");

    // Переход на следующую enabled кнопку с помощью ArrowRight
    await user.keyboard("{ArrowRight}");
    expect(enabledChips[1]).toHaveFocus();
    expect(enabledChips[1]).toHaveAttribute("data-focused", "true");
    expect(enabledChips[0]).toHaveAttribute("data-focused", "false");

    // Переход обратно на первую с помощью ArrowLeft
    await user.keyboard("{ArrowLeft}");
    expect(enabledChips[0]).toHaveFocus();
    expect(enabledChips[0]).toHaveAttribute("data-focused", "true");
    expect(enabledChips[1]).toHaveAttribute("data-focused", "false");
  });

  test("циклическая навигация по клавиатуре пропускает disabled кнопки", async () => {
    const user = userEvent.setup();
    render(<ChoiceChips options={defaultOptions} />);

    const enabledChips = getEnabledChips();
    expect(enabledChips).toHaveLength(2);

    // Фокусируем первую enabled кнопку
    await user.tab();
    expect(enabledChips[0]).toHaveFocus();

    // Переход на следующую enabled кнопку
    await user.keyboard("{ArrowRight}");
    expect(enabledChips[1]).toHaveFocus();

    // Переход с последней enabled кнопки на первую (циклически)
    await user.keyboard("{ArrowRight}");
    expect(enabledChips[0]).toHaveFocus();

    // Переход с первой кнопки на последнюю enabled (циклически)
    await user.keyboard("{ArrowLeft}");
    expect(enabledChips[1]).toHaveFocus();
  });

  test("disabled кнопки не получают фокус при навигации", async () => {
    const user = userEvent.setup();
    render(<ChoiceChips options={defaultOptions} />);

    const disabledChip = getChipByValue("3");
    const enabledChips = getEnabledChips();

    // Фокусируем первую enabled кнопку
    await user.tab();
    expect(enabledChips[0]).toHaveFocus();

    // Переход на следующую enabled кнопку (минуя disabled)
    await user.keyboard("{ArrowRight}");
    expect(enabledChips[1]).toHaveFocus();
    expect(disabledChip).not.toHaveFocus();

    // Еще раз ArrowRight - должен циклически вернуться к первой enabled кнопке
    await user.keyboard("{ArrowRight}");
    expect(enabledChips[0]).toHaveFocus();
    expect(disabledChip).not.toHaveFocus();
  });

  test("правильные ARIA атрибуты", () => {
    render(<ChoiceChips options={defaultOptions} value="1" />);

    const container = screen.getByRole("radiogroup");
    expect(container).toBeInTheDocument();

    const chips = screen.getAllByRole("radio");
    expect(chips).toHaveLength(3);

    const selectedChip = getChipByValue("1");
    expect(selectedChip).toHaveAttribute("aria-checked", "true");

    const unselectedChip = getChipByValue("2");
    expect(unselectedChip).toHaveAttribute("aria-checked", "false");
  });

  test("обработка фокуса и blur", async () => {
    const user = userEvent.setup();
    render(<ChoiceChips options={defaultOptions} />);

    const option1 = screen.getByTestId("chip-1");

    await user.tab();
    expect(option1).toHaveFocus();
    expect(option1).toHaveAttribute("data-focused", "true");

    await user.tab();
    expect(option1).not.toHaveFocus();
    // После blur focusedIndex становится -1, поэтому data-focused="false"
    expect(option1).toHaveAttribute("data-focused", "false");
  });

  test("работа с пустым массивом опций", () => {
    render(<ChoiceChips options={[]} />);

    const chips = screen.queryAllByRole("radio");
    expect(chips).toHaveLength(0);
  });

  test("сохранение выбора при перерендере", () => {
    const { rerender } = render(
      <ChoiceChips options={defaultOptions} value="1" />,
    );

    let option1 = getChipByValue("1");
    expect(option1).toHaveAttribute("data-selected", "true");

    rerender(<ChoiceChips options={defaultOptions} value="2" />);

    option1 = getChipByValue("1");
    const option2 = getChipByValue("2");

    expect(option1).toHaveAttribute("data-selected", "false");
    expect(option2).toHaveAttribute("data-selected", "true");
  });

  test("сбрасывает выбор при клике на активную кнопку когда isToggle=true", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <ChoiceChips
        options={defaultOptions}
        value="1"
        onChange={handleChange}
        isToggle={true}
      />,
    );

    const option1 = getChipByValue("1");
    expect(option1).toHaveAttribute("data-selected", "true");

    // Кликаем на активную кнопку - должен сбросить выбор
    await user.click(screen.getByText("Option 1"));

    // Проверяем, что кнопка больше не выбрана
    expect(option1).toHaveAttribute("data-selected", "false");
    expect(handleChange).toHaveBeenCalledWith(null);
  });

  test("toggle функциональность работает корректно", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <ChoiceChips
        options={defaultOptions}
        onChange={handleChange}
        isToggle={true}
      />,
    );

    const option1 = screen.getByText("Option 1").closest("button");
    const option2 = screen.getByText("Option 2").closest("button");

    // Выбираем Option 1
    await user.click(screen.getByText("Option 1"));
    expect(option1).toHaveAttribute("data-selected", "true");
    expect(handleChange).toHaveBeenCalledWith("1");

    // Кликаем еще раз - должен сбросить
    await user.click(screen.getByText("Option 1"));
    expect(option1).toHaveAttribute("data-selected", "false");
    expect(handleChange).toHaveBeenCalledWith(null);

    // Выбираем Option 2
    await user.click(screen.getByText("Option 2"));
    expect(option2).toHaveAttribute("data-selected", "true");
    expect(handleChange).toHaveBeenCalledWith("2");

    // Кликаем на Option 1 - должен переключиться
    await user.click(screen.getByText("Option 1"));
    expect(option1).toHaveAttribute("data-selected", "true");
    expect(option2).toHaveAttribute("data-selected", "false");
    expect(handleChange).toHaveBeenCalledWith("1");
  });

  test("toggle функциональность вызывает onChange с правильными значениями", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    // Тестируем выбор неактивной кнопки
    const { rerender } = render(
      <ChoiceChips
        options={defaultOptions}
        value={null}
        onChange={handleChange}
        isToggle={true}
      />,
    );

    // Выбираем Option 1
    await user.click(screen.getByText("Option 1"));
    expect(handleChange).toHaveBeenCalledWith("1");

    // Тестируем сброс выбора активной кнопки
    rerender(
      <ChoiceChips
        options={defaultOptions}
        value="1"
        onChange={handleChange}
        isToggle={true}
      />,
    );

    // Кликаем на активную Option 1 - должен сбросить
    await user.click(screen.getByText("Option 1"));
    expect(handleChange).toHaveBeenCalledWith(null);

    // Выбираем Option 2
    rerender(
      <ChoiceChips
        options={defaultOptions}
        value={null}
        onChange={handleChange}
        isToggle={true}
      />,
    );

    await user.click(screen.getByText("Option 2"));
    expect(handleChange).toHaveBeenCalledWith("2");
  });
});
