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

// Daily Log for Period Tracking
export interface DailyLog {
  id: string;
  userId: string;
  cycleId?: string;
  date: string;

  // Period details
  flow?: 'light' | 'moderate' | 'heavy';
  cramps?: number; // 0-5 scale

  // Symptoms & Mood
  symptoms: string[];
  mood: string[];

  // Sex & Protection
  hadSex: boolean;
  contraception: string[];
  sexNotes?: string;

  // Medications & Health
  medications: string[];
  healthNotes?: string;

  // Attachments
  attachments: string[];

  createdAt: string;
  updatedAt: string;
}

export const DailyLogSchema = z.object({
  date: z.string().datetime(),
  flow: z.enum(['light', 'moderate', 'heavy']).optional(),
  cramps: z.number().min(0).max(5).int().optional(),
  symptoms: z.array(z.string()).default([]),
  mood: z.array(z.string()).default([]),
  hadSex: z.boolean().default(false),
  contraception: z.array(z.string()).default([]),
  sexNotes: z.string().optional(),
  medications: z.array(z.string()).default([]),
  healthNotes: z.string().optional(),
  attachments: z.array(z.string()).default([]),
});

// Calendar Day Marker Types
export type CalendarMarker =
  | 'period'
  | 'fertile'
  | 'ovulation'
  | 'sex'
  | 'symptom'
  | 'medication'
  | 'appointment';

export interface CalendarDayData {
  date: Date;
  isPeriod: boolean;
  isFertile: boolean;
  isPredicted: boolean;
  isOvulation: boolean;
  cycleDay?: number;
  markers: CalendarMarker[];
  dailyLog?: DailyLog;
}

// Cycle Health Statistics
export interface CycleHealthStats {
  averageCycleLength: number;
  cycleVariance: number; // standard deviation
  averagePeriodLength: number;
  last3Cycles: number[];
  confidence: 'low' | 'medium' | 'high';
}
