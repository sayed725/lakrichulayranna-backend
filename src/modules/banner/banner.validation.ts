import { z } from 'zod';

const createBannerSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    imageUrl: z.string().url('Invalid image URL'),
    link: z.string().optional(),
    isActive: z.boolean().optional(),
    order: z.number().int().optional(),
  }),
});

const updateBannerSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    imageUrl: z.string().url().optional(),
    link: z.string().optional(),
    isActive: z.boolean().optional(),
    order: z.number().int().optional(),
  }),
});

export const BannerValidation = {
  createBannerSchema,
  updateBannerSchema,
};
