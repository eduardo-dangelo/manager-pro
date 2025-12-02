import z from 'zod';

export const AssetValidation = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().min(0).max(5000).optional(),
  color: z.string().optional(),
  status: z.enum(['active', 'completed', 'archived', 'on-hold']).optional(),
  type: z.enum(['vehicle', 'property', 'person', 'project', 'trip', 'custom']),
  tabs: z.array(z.string()).default(['overview']),
  // Conditional fields (optional, not used in form but kept for backward compatibility)
  registrationNumber: z.string().optional(),
  address: z.string().optional(),
  // JSON field for type-specific metadata (vehicle specs, maintenance, property info, etc.)
  metadata: z.record(z.string(), z.any()).optional(),
});

export const UpdateAssetValidation = AssetValidation.omit({ type: true }).partial();

export type AssetInput = z.infer<typeof AssetValidation>;
export type UpdateAssetInput = z.infer<typeof UpdateAssetValidation>;
