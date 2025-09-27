import { z, ZodError } from "zod";
import { ValidationError } from "../errors/AppError";

/**
 * Validates data against a Zod schema and throws ValidationError with field-specific messages
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated and typed data
 * @throws ValidationError with field-specific error messages
 */
export const validateData = <T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      // Transform Zod errors into our field-specific error format
      const fields: Record<string, string> = {};

      //   error.errors.forEach((err) => {
      error.issues.forEach((err) => {
        const fieldPath = err.path.join(".");
        fields[fieldPath] = err.message;
      });

      throw new ValidationError("Validation failed", fields);
    }

    // Re-throw unexpected errors
    throw error;
  }
};

/**
 * Async version of validateData for consistency with async operations
 * Useful when validation might involve async checks in the future
 */
export const validateDataAsync = async <T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): Promise<z.infer<T>> => {
  return validateData(schema, data);
};
