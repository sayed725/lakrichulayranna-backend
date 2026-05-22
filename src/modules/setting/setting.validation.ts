import { z } from 'zod';

const updateSettingSchema = z.object({
  body: z.object({
    siteName: z.string().optional(),
    tagline: z.string().optional(),
    logoUrl: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
    facebookUrl: z.string().url().optional(),
    instagramUrl: z.string().url().optional(),
  }),
});

export const SettingValidation = {
  updateSettingSchema,
};
