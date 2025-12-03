/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { act, renderHook, waitFor } from "@testing-library/react";

import { useLoaderData, useLocation, useNavigate } from "react-router";

import { useSyncUrlParam } from "./useSyncUrlParam";

jest.mock("react-router", () => ({
  useLoaderData: jest.fn(),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

const mockUseLoaderData = useLoaderData as jest.MockedFunction<
  typeof useLoaderData
>;
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;

describe("useSyncUrlParam", () => {
  const mockNavigate = jest.fn();
  const mockOnParamChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseLocation.mockReturnValue({
      pathname: "/test",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    const params = new URLSearchParams("testParam=initialValue&otherParam=123");
    mockUseLoaderData.mockReturnValue(params);
  });

  describe("basic behavior", () => {
    it("returns current parameter value", () => {
      const { result } = renderHook(() =>
        useSyncUrlParam("testParam", mockOnParamChange),
      );

      expect(result.current.currentParamValue).toBe("initialValue");
    });

    it("calls onParamChange with initial value", () => {
      renderHook(() => useSyncUrlParam("testParam", mockOnParamChange));

      expect(mockOnParamChange).toHaveBeenCalledWith("initialValue");
      expect(mockOnParamChange).toHaveBeenCalledTimes(1);
    });

    it("calls onParamChange when parameter value changes", async () => {
      const { rerender } = renderHook(
        ({ paramName, onParamChange }) =>
          useSyncUrlParam(paramName, onParamChange),
        {
          initialProps: {
            paramName: "testParam",
            onParamChange: mockOnParamChange,
          },
        },
      );

      const newParams = new URLSearchParams(
        "testParam=newValue&otherParam=123",
      );
      mockUseLoaderData.mockReturnValue(newParams);

      rerender({
        paramName: "testParam",
        onParamChange: mockOnParamChange,
      });

      await waitFor(() => {
        expect(mockOnParamChange).toHaveBeenCalledWith("newValue");
      });

      expect(mockOnParamChange).toHaveBeenCalledTimes(2);
    });
  });

  describe("error handling", () => {
    let originalError: typeof console.error;

    beforeEach(() => {
      originalError = console.error;
      console.error = jest.fn();
    });

    afterEach(() => {
      console.error = originalError;
    });

    it("throws error when parameter is not found in URL", () => {
      const params = new URLSearchParams("otherParam=123");
      mockUseLoaderData.mockReturnValue(params);

      const renderHookWithMissingParam = () => {
        renderHook(() =>
          useSyncUrlParam("nonExistentParam", mockOnParamChange),
        );
      };

      expect(renderHookWithMissingParam).toThrow(
        'Parameter "nonExistentParam" not found in URL.',
      );
    });

    it("throws error when parameter value is empty", () => {
      const params = new URLSearchParams("emptyParam=");
      mockUseLoaderData.mockReturnValue(params);

      const renderHookWithEmptyParam = () => {
        renderHook(() => useSyncUrlParam("emptyParam", mockOnParamChange));
      };

      expect(renderHookWithEmptyParam).toThrow(
        'Parameter "emptyParam" not found in URL.',
      );
    });

    it("throws error when parameter exists but its value is null", () => {
      const mockParams = {
        get: jest.fn().mockReturnValue(null),
      } as unknown as URLSearchParams;

      mockUseLoaderData.mockReturnValue(mockParams);

      const renderHookWithNullParam = () => {
        renderHook(() => useSyncUrlParam("nullParam", mockOnParamChange));
      };

      expect(renderHookWithNullParam).toThrow(
        'Parameter "nullParam" not found in URL.',
      );
    });
  });

  describe("updateParamInUrl function", () => {
    it("updates parameter in URL using navigate", () => {
      const { result } = renderHook(() =>
        useSyncUrlParam("testParam", mockOnParamChange),
      );

      act(() => {
        result.current.updateParamInUrl("updatedValue");
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        "/test?testParam=updatedValue&otherParam=123",
        { replace: true },
      );
    });

    it("preserves other parameters when updating", () => {
      const { result } = renderHook(() =>
        useSyncUrlParam("testParam", mockOnParamChange),
      );

      act(() => {
        result.current.updateParamInUrl("newTestValue");
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining("otherParam=123"),
        { replace: true },
      );
    });

    it("works correctly when location already has query string", () => {
      mockUseLocation.mockReturnValue({
        pathname: "/test",
        search: "?existing=param",
        hash: "",
        state: null,
        key: "default",
      });

      const { result } = renderHook(() =>
        useSyncUrlParam("testParam", mockOnParamChange),
      );

      act(() => {
        result.current.updateParamInUrl("updatedValue");
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        "/test?testParam=updatedValue&otherParam=123",
        { replace: true },
      );
    });
  });

  describe("edge cases", () => {
    it("handles special characters in parameter value", () => {
      const { result } = renderHook(() =>
        useSyncUrlParam("testParam", mockOnParamChange),
      );

      const valueWithSpecialChars = "test&value=complex?query#hash";

      act(() => {
        result.current.updateParamInUrl(valueWithSpecialChars);
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining(
          `testParam=${encodeURIComponent(valueWithSpecialChars)}`,
        ),
        { replace: true },
      );
    });

    it("works with multiple hook instances for different parameters", () => {
      const onParamChange1 = jest.fn();
      const onParamChange2 = jest.fn();

      const { result: result1 } = renderHook(() =>
        useSyncUrlParam("testParam", onParamChange1),
      );

      const { result: result2 } = renderHook(() =>
        useSyncUrlParam("otherParam", onParamChange2),
      );

      expect(result1.current.currentParamValue).toBe("initialValue");
      expect(result2.current.currentParamValue).toBe("123");

      expect(onParamChange1).toHaveBeenCalledWith("initialValue");
      expect(onParamChange2).toHaveBeenCalledWith("123");
    });

    it("does not call onParamChange if component is unmounted", () => {
      const { unmount } = renderHook(() =>
        useSyncUrlParam("testParam", mockOnParamChange),
      );

      unmount();

      // onParamChange should only be called once during mounting
      expect(mockOnParamChange).toHaveBeenCalledTimes(1);
    });

    it("works with numeric parameter values (converted to strings)", () => {
      const params = new URLSearchParams("numericParam=42&floatParam=3.14");
      mockUseLoaderData.mockReturnValue(params);

      const { result } = renderHook(() =>
        useSyncUrlParam("numericParam", mockOnParamChange),
      );

      expect(result.current.currentParamValue).toBe("42");

      act(() => {
        result.current.updateParamInUrl("100");
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining("numericParam=100"),
        { replace: true },
      );
    });

    it("updates URL correctly when only one parameter exists", () => {
      const params = new URLSearchParams("singleParam=value");
      mockUseLoaderData.mockReturnValue(params);

      const { result } = renderHook(() =>
        useSyncUrlParam("singleParam", mockOnParamChange),
      );

      act(() => {
        result.current.updateParamInUrl("newValue");
      });

      expect(mockNavigate).toHaveBeenCalledWith("/test?singleParam=newValue", {
        replace: true,
      });
    });
  });
});
