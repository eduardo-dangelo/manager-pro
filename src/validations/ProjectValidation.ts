import z from 'zod';

export const ProjectValidation = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().min(0).max(5000),
  color: z.string().default('gray'),
  status: z.enum(['active', 'completed', 'archived', 'on-hold']).default('active'),
});

export const UpdateProjectValidation = ProjectValidation.partial();

export type ProjectInput = z.infer<typeof ProjectValidation>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectValidation>;
