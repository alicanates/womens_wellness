import { z } from 'zod';

// Username validation
export const UsernameSchema = z
  .string()
  .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
  .max(24, 'Kullanıcı adı en fazla 24 karakter olabilir')
  .regex(/^[a-z0-9._]+$/i, 'Sadece harf, rakam, "." ve "_" kullanılabilir');

// Step 1: Identity & Access
export const IdentitySchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  username: UsernameSchema,
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  birthDate: z.date({
    required_error: 'Doğum tarihi gereklidir',
    invalid_type_error: 'Geçerli bir tarih seçin',
  }).refine((date) => {
    const now = new Date();
    return date < now;
  }, 'Doğum tarihi gelecekte olamaz'),
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .regex(
      /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/,
      'En az 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir'
    ),
});

export type IdentityInput = z.infer<typeof IdentitySchema>;

// Step 2: Period Info (optional)
export const PeriodSchema = z.object({
  lastPeriodDate: z.date().optional(),
});

export type PeriodInput = z.infer<typeof PeriodSchema>;

// Step 3: Privacy & Consents
export const ConsentSchema = z.object({
  acceptPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'Gizlilik politikasını kabul etmelisiniz' }),
  }),
  aiMemoryOptIn: z.boolean().optional(),
});

export type ConsentInput = z.infer<typeof ConsentSchema>;

// Step 4: Notification Preferences
export const NotificationSchema = z.object({
  intensity: z.enum(['light', 'medium', 'high']).default('light'),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
});

export type NotificationInput = z.infer<typeof NotificationSchema>;

// Helper function to calculate password strength
export const calculatePasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Zayıf', color: '#EF4444' };
  if (score <= 4) return { score, label: 'Orta', color: '#F59E0B' };
  return { score, label: 'Güçlü', color: '#10B981' };
};
