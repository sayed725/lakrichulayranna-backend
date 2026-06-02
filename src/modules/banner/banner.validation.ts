import { z } from 'zod';

const createBannerSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    badge: z.string().optional(),
    image: z.string().url('Invalid image URL').optional(),
    order: z.number().int().optional(),
    banner: z.boolean().optional(),
    isActive: z.boolean().optional(),
    categoryId: z.string().optional(),
    buttonText: z.string().optional(),
  }),
});

const updateBannerSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    badge: z.string().optional(),
    image: z.string().url().optional(),
    order: z.number().int().optional(),
    banner: z.boolean().optional(),
    isActive: z.boolean().optional(),
    categoryId: z.string().optional(),
    buttonText: z.string().optional(),
  }),
});

export const BannerValidation = {
  createBannerSchema,
  updateBannerSchema,
};
