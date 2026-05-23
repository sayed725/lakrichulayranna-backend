import { z } from 'zod';
import { DiscountType } from '@prisma/client';

const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Code is required'),
    title: z.string().min(1, 'Title is required'),
    discountType: z.enum([DiscountType.PERCENTAGE, DiscountType.FIXED]).optional(),
    discountValue: z.number().positive(),
    minOrderAmount: z.number().nonnegative().optional(),
    maxDiscountAmount: z.number().nonnegative().optional(),
    expiryDate: z.string().datetime(),
    usageLimit: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
    description: z.string().optional(),
  }),
});

const updateCouponSchema = z.object({
  body: z.object({
    code: z.string().optional(),
    title: z.string().optional(),
    discountType: z.enum([DiscountType.PERCENTAGE, DiscountType.FIXED]).optional(),
    discountValue: z.number().positive().optional(),
    minOrderAmount: z.number().nonnegative().optional(),
    maxDiscountAmount: z.number().nonnegative().optional(),
    expiryDate: z.string().datetime().optional(),
    usageLimit: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
    description: z.string().optional(),
  }),
});

export const CouponValidation = {
  createCouponSchema,
  updateCouponSchema,
};
