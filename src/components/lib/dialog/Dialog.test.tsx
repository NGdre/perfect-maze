import { fireEvent, render, screen } from "@testing-library/react";

import { Dialog, DialogButton } from "./Dialog";

describe("Dialog", () => {
  const mockOnClose = jest.fn();

  const defaultButtons: DialogButton[] = [
    {
      text: "Confirm",
      onClick: jest.fn(),
      variant: "primary",
    },
    {
      text: "Cancel",
      onClick: jest.fn(),
    },
  ];

  const defaultProps = {
    title: "Test Dialog",
    message: "Test message",
    buttons: defaultButtons,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders dialog with correct content", () => {
    render(<Dialog {...defaultProps} />);

    expect(screen.getByText("Test Dialog")).toBeInTheDocument();
    expect(screen.getByText("Test message")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("calls onClose when Escape key is pressed", () => {
    render(<Dialog {...defaultProps} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when overlay is clicked", () => {
    render(<Dialog {...defaultProps} />);

    fireEvent.click(screen.getByRole("presentation"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls button onClick and onClose when button is clicked", () => {
    render(<Dialog {...defaultProps} />);

    fireEvent.click(screen.getByText("Confirm"));

    expect(defaultButtons[0].onClick).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("stops propagation when dialog content is clicked", () => {
    render(<Dialog {...defaultProps} />);

    const content = screen.getByRole("dialog").firstChild!;
    const stopPropagation = jest.spyOn(Event.prototype, "stopPropagation");

    fireEvent.click(content);

    expect(stopPropagation).toHaveBeenCalledTimes(1);
  });
});
