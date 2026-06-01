import { z } from 'zod';

const createItemSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.number().positive(),
    discountPrice: z.number().nonnegative().optional(),
    imageUrl: z.string().url('Invalid image URL'),
    images: z.array(z.string().url()).min(1),
    categoryId: z.string().uuid('Invalid category ID'),
    isAvailable: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isBestSelling: z.boolean().optional(),
    isSpicy: z.boolean().optional(),
    weight: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const updateItemSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    discountPrice: z.number().nonnegative().optional(),
    imageUrl: z.string().url().optional(),
    images: z.array(z.string().url()).optional(),
    categoryId: z.string().uuid().optional(),
    isAvailable: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isBestSelling: z.boolean().optional(),
    isSpicy: z.boolean().optional(),
    weight: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const ItemValidation = {
  createItemSchema,
  updateItemSchema,
};
