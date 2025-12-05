export interface ParamValidationInput {
  param: string | null;
  fallback: string;
}

export interface ValidationResult {
  value: string;
  isValid: boolean;
}

export const validateUrlParam = (
  input: ParamValidationInput,
  allowedValues: string[],
): ValidationResult => {
  const isValid = input.param !== null && allowedValues.includes(input.param);

  return {
    value: isValid ? (input.param as string) : input.fallback,
    isValid,
  };
};
