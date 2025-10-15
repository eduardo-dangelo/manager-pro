import z from 'zod';

export const SprintValidation = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().min(0).max(5000),
  projectId: z.number().int().positive(),
  workSpaceId: z.number().int().positive().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  status: z.enum(['planned', 'active', 'completed', 'cancelled']).default('planned'),
});

export const UpdateSprintValidation = SprintValidation.partial().extend({
  id: z.number().int().positive(),
});

export type SprintInput = z.infer<typeof SprintValidation>;
export type UpdateSprintInput = z.infer<typeof UpdateSprintValidation>;
