import { z } from 'zod'

export const VM_NAME_MAX_LENGTH = 255

export const createVmBodySchema = z.object({
  name: z
    .string()
    .min(1, 'name is required')
    .max(VM_NAME_MAX_LENGTH, `name must be at most ${VM_NAME_MAX_LENGTH} characters`)
})

export type CreateVmBody = z.infer<typeof createVmBodySchema>
