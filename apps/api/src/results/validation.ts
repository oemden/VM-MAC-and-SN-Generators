import { z } from 'zod'

/** Max length for comment field (design: 500) */
export const COMMENT_MAX_LENGTH = 500

/** Max length for vm_name field (design: 255) */
export const VM_NAME_MAX_LENGTH = 255

/** Default and max for GET limit (design: default 50, max 200) */
export const RESULTS_LIMIT_DEFAULT = 50
export const RESULTS_LIMIT_MAX = 200

/** Schema for POST /api/results request body */
export const saveResultsBodySchema = z.object({
  type: z.enum(['sn', 'mac'], { error: 'type must be "sn" or "mac"' }),
  values: z
    .array(z.string().min(1, 'values must contain non-empty strings'))
    .min(1, 'values must be a non-empty array'),
  comment: z
    .string()
    .max(COMMENT_MAX_LENGTH, `comment must be at most ${COMMENT_MAX_LENGTH} characters`)
    .optional()
    .or(z.literal('')),
  vm_id: z.number().int().positive().optional(),
  vm_name: z
    .string()
    .max(VM_NAME_MAX_LENGTH, `vm_name must be at most ${VM_NAME_MAX_LENGTH} characters`)
    .optional()
    .or(z.literal(''))
})

export type SaveResultsBody = z.infer<typeof saveResultsBodySchema>

export interface ValidationErrorDetail {
  field: string
  message: string
}

export interface ValidationResult {
  success: true
  data: SaveResultsBody
}

export interface ValidationFailure {
  success: false
  error: string
  details: ValidationErrorDetail[]
}

/**
 * Validates POST /api/results body. Returns parsed data or structured error for 400 response.
 */
export function validateSaveResultsBody(
  body: unknown
): ValidationResult | ValidationFailure {
  const result = saveResultsBodySchema.safeParse(body)

  if (result.success) {
    const data = result.data
    return {
      success: true,
      data: {
        ...data,
        comment: data.comment === '' ? undefined : data.comment,
        vm_name: data.vm_name === '' ? undefined : data.vm_name
      }
    }
  }

  const issues = result.error.issues ?? []
  const details: ValidationErrorDetail[] = issues.map((e) => ({
    field: (e.path ?? []).map(String).join('.') || 'body',
    message: e.message
  }))

  const firstMessage = details[0]?.message ?? 'Validation failed'
  return {
    success: false,
    error: firstMessage,
    details
  }
}
