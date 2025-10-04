import { z } from 'zod';

// Period Symptoms JSON Schema
export interface PeriodSymptoms {
  flow: 'light' | 'moderate' | 'heavy';
  cramps: 0 | 1 | 2 | 3 | 4 | 5; // severity scale
  mood: string[]; // e.g. ['irritable','sad','anxious','happy']
  physical: string[]; // e.g. ['headache','backache','bloating','fatigue']
  notes?: string;
}

export const PeriodSymptomsSchema = z.object({
  flow: z.enum(['light', 'moderate', 'heavy']),
  cramps: z.number().min(0).max(5).int(),
  mood: z.array(z.string()),
  physical: z.array(z.string()),
  notes: z.string().optional(),
});
