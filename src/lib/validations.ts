import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

// Helper to format Zod validation errors into a user-friendly object
export function formatValidationErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const field = issue.path.join('.') || '_form'
    const message = issue.message
    if (!fieldErrors[field]) {
      fieldErrors[field] = []
    }
    fieldErrors[field].push(message)
  }
  return fieldErrors
}

// Helper to validate and parse
export function validateBody<T>(schema: z.ZodType<T>, body: unknown) {
  return schema.safeParse(body)
}
