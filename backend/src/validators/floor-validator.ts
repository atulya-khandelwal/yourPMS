import { z } from 'zod';

export const createFloorSchema = z.object({
  property_id: z.number().int().positive(),
});

export type CreateFloorInput = z.infer<typeof createFloorSchema>;
