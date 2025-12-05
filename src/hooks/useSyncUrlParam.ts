import { useEffect } from "react";
import { useLoaderData, useLocation, useNavigate } from "react-router";

interface UseSyncUrlParamOptions {
  shouldThrowNotFound?: boolean;
}

interface UseSyncUrlParamReturn<T extends boolean> {
  updateParamInUrl(updatedValue: string): void;
  currentParamValue: T extends true ? string : string | null;
}

export function useSyncUrlParam<T extends boolean = true>(
  paramName: string,
  onParamChange: (paramValue: string) => void | Promise<void>,
  options?: { shouldThrowNotFound?: T } & UseSyncUrlParamOptions,
): UseSyncUrlParamReturn<T> {
  const { shouldThrowNotFound = true } = options ?? {};

  const params = useLoaderData<URLSearchParams>();
  const navigate = useNavigate();
  const location = useLocation();

  const currentParamValue = params.get(paramName);

  if (!currentParamValue && shouldThrowNotFound)
    throw new Error(`Parameter "${paramName}" not found in URL.`);

  useEffect(() => {
    const handleParamChange = async () => {
      try {
        if (currentParamValue) {
          await onParamChange(currentParamValue);
        }
      } catch (error) {
        console.error(
          `Error in onParamChange for parameter "${paramName}":`,
          error,
        );
      }
    };

    handleParamChange();
  }, [currentParamValue]);

  return {
    updateParamInUrl(updatedValue: string) {
      const newParams = new URLSearchParams(params);

      newParams.set(paramName, updatedValue);

      navigate(`${location.pathname}?${newParams.toString()}`, {
        replace: true,
      });
    },
    currentParamValue: currentParamValue,
  } as UseSyncUrlParamReturn<T>;
}
