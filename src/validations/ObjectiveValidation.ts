import z from 'zod';

export const ObjectiveValidation = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().min(0).max(5000),
  projectId: z.number().int().positive(),
  status: z.enum(['active', 'completed', 'archived']).default('active'),
});

export const UpdateObjectiveValidation = ObjectiveValidation.partial().extend({
  id: z.number().int().positive(),
});

export type ObjectiveInput = z.infer<typeof ObjectiveValidation>;
export type UpdateObjectiveInput = z.infer<typeof UpdateObjectiveValidation>;
