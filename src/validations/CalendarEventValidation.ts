import z from 'zod';

export const RemindersSchema = z.object({
  useDefault: z.boolean(),
  overrides: z.array(
    z.object({
      method: z.enum(['email', 'popup']),
      minutes: z.number().int().min(0),
    }),
  ).max(5),
});

export const CalendarEventValidation = z.object({
  assetId: z.number().int().positive(),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().min(0).max(5000).optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  reminders: RemindersSchema.nullable().optional(),
});

export const UpdateCalendarEventValidation = CalendarEventValidation.partial().extend({
  id: z.number().int().positive(),
});

export type CalendarEventInput = z.infer<typeof CalendarEventValidation>;
export type UpdateCalendarEventInput = z.infer<typeof UpdateCalendarEventValidation>;
