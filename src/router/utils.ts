import { redirect } from "react-router";

export const createRedirectWithParams = (
  pathname: string,
  params: URLSearchParams,
) => {
  return redirect(`${pathname}?${params.toString()}`);
};

export const setSearchParam = (
  url: URL,
  paramName: string,
  newValue: string,
) => {
  const params = url.searchParams;
  const newParams = new URLSearchParams(params);

  newParams.set(paramName, newValue);

  throw createRedirectWithParams(url.pathname, newParams);
};

export const deleteSearchParam = (url: URL, paramName: string) => {
  const newParams = new URLSearchParams(url.searchParams);
  newParams.delete(paramName);
  throw createRedirectWithParams(url.pathname, newParams);
};
