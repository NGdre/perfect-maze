import { useEffect } from "react";
import { useLoaderData, useLocation, useNavigate } from "react-router";

export function useSyncUrlParam(
  paramName: string,
  onParamChange: (paramValue: string) => void,
) {
  const params = useLoaderData<URLSearchParams>();
  const navigate = useNavigate();
  const location = useLocation();

  const currentParamValue = params.get(paramName);

  if (!currentParamValue)
    throw new Error(`Parameter "${paramName}" not found in URL.`);

  useEffect(() => {
    if (currentParamValue) onParamChange(currentParamValue);
  }, [currentParamValue]);

  return {
    updateParamInUrl(updatedValue: string) {
      const newParams = new URLSearchParams(params);

      newParams.set(paramName, updatedValue);

      navigate(`${location.pathname}?${newParams.toString()}`, {
        replace: true,
      });
    },
    currentParamValue,
  };
}
