import { z } from 'zod';

const createReviewSchema = z.object({
  body: z.object({
    itemId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
  }),
});

export const ReviewValidation = {
  createReviewSchema,
};
