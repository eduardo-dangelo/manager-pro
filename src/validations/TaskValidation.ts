import z from 'zod';

export const TaskValidation = z.object({
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

export const UpdateTaskValidation = TaskValidation.partial().extend({
  id: z.number().int().positive(),
});

export type TaskInput = z.infer<typeof TaskValidation>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskValidation>;
