import { renderHook, act } from "@testing-library/react";
import { useDialog } from "./useDialog";
import { DialogConfig } from "./Dialog";

describe("useDialog", () => {
  const mockConfig: DialogConfig = {
    title: "Test Title",
    message: "Test Message",
    buttons: [],
    onClose: jest.fn(),
  };

  it("should initialize with null dialog", () => {
    const { result } = renderHook(() => useDialog());

    expect(result.current.dialog).toBeNull();
  });

  it("should show dialog when showDialog is called", () => {
    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.showDialog(mockConfig);
    });

    expect(result.current.dialog).toEqual(mockConfig);
  });

  it("should hide dialog when hideDialog is called", () => {
    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.showDialog(mockConfig);
    });
    expect(result.current.dialog).toEqual(mockConfig);

    act(() => {
      result.current.hideDialog();
    });
    expect(result.current.dialog).toBeNull();
  });

  it("should update dialog config when showDialog is called multiple times", () => {
    const { result } = renderHook(() => useDialog());
    const newConfig: DialogConfig = {
      title: "New Title",
      message: "New Message",
      buttons: [],
    };

    act(() => {
      result.current.showDialog(mockConfig);
    });
    expect(result.current.dialog).toEqual(mockConfig);

    act(() => {
      result.current.showDialog(newConfig);
    });
    expect(result.current.dialog).toEqual(newConfig);
  });
});
