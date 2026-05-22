import { z } from 'zod';
import { DiscountType } from '@prisma/client';

const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Code is required'),
    discountType: z.enum([DiscountType.PERCENTAGE, DiscountType.FIXED]),
    discountValue: z.number().positive(),
    minOrderAmount: z.number().nonnegative().optional(),
    maxUses: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
    expiresAt: z.string().datetime().optional(),
  }),
});

const updateCouponSchema = z.object({
  body: z.object({
    code: z.string().optional(),
    discountType: z.enum([DiscountType.PERCENTAGE, DiscountType.FIXED]).optional(),
    discountValue: z.number().positive().optional(),
    minOrderAmount: z.number().nonnegative().optional(),
    maxUses: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
    expiresAt: z.string().datetime().optional(),
  }),
});

export const CouponValidation = {
  createCouponSchema,
  updateCouponSchema,
};
