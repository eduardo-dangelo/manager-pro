import z from 'zod';

export const AssetValidation = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().min(0).max(5000),
  color: z.string().default('gray'),
  status: z.enum(['active', 'completed', 'archived', 'on-hold']).default('active'),
  type: z.enum(['vehicle', 'property', 'person', 'project', 'trip']),
  tabs: z.array(z.string()).default(['overview']),
});

export const UpdateAssetValidation = AssetValidation.omit({ type: true }).partial();

export type AssetInput = z.infer<typeof AssetValidation>;
export type UpdateAssetInput = z.infer<typeof UpdateAssetValidation>;

