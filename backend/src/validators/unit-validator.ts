import { z } from 'zod';

export const createUnitSchema = z.object({
  floor_id: z.number().int().positive(),
});

export const bookUnitSchema = z.object({
  unit_id: z.number().int().positive()
});

export const availableUnitsSchema = z.object({
  property_id: z.number().int().positive()
});

export type AvailableUnitsINput = z.infer<typeof availableUnitsSchema>
export type BookUnitInput = z.infer<typeof bookUnitSchema>;
export type CreateUnitInput = z.infer<typeof createUnitSchema>;
