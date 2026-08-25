import { z } from 'zod';

const createReviewSchema = z.object({
  body: z.object({
    itemId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
    reviewerName: z.string().optional(),
    reviewerEmail: z.string().email().optional(),
  }),
});

const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().optional(),
  }),
});

const adminUpdateReviewSchema = z.object({
  body: z.object({
    isApproved: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
  }),
});

export const ReviewValidation = {
  createReviewSchema,
  updateReviewSchema,
  adminUpdateReviewSchema,
};
