import { z } from 'zod';

export const createPropertySchema = z.object({
  user_id: z.number().int().positive(),
  name: z.string().min(1, 'Name is required'),
  address: z.string(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;