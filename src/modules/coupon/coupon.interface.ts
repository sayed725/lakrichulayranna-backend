import { DiscountType } from '@prisma/client';

export type TCreateCoupon = {
  code: string;
  title: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  expiryDate: string;
  usageLimit?: number;
  isActive?: boolean;
  description?: string;
};

export type TUpdateCoupon = Partial<TCreateCoupon>;
