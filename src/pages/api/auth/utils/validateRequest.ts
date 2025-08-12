import { z } from 'zod';

type ValidationError = {
    field: string;
    message: string;
    code?: string; // Optional: useful for mobile error handling
};

export function validateRequest<T>(schema: z.Schema<T>, data: unknown): | { success: true; data: T }
  | { success: false; errors: ValidationError[] }  {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code, // Optional: useful for mobile error handling
    }));

    return { success: false, errors };
  }

  return { success: true, data: result.data };
}
