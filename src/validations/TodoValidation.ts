import z from 'zod';

export const TodoValidation = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().min(0).max(5000),
  projectId: z.number().int().positive(),
  objectiveId: z.number().int().positive().optional().nullable(),
  parentTaskId: z.number().int().positive().optional().nullable(),
  status: z.enum(['todo', 'in-progress', 'review', 'done', 'blocked']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  sprintIds: z.array(z.number().int().positive()).optional().nullable(),
});

export const UpdateTodoValidation = TodoValidation.partial().extend({
  id: z.number().int().positive(),
});

export type TodoInput = z.infer<typeof TodoValidation>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoValidation>;
