import { DiscountType } from '@prisma/client';

export type TCreateCoupon = {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  isActive?: boolean;
  expiresAt?: string;
};

export type TUpdateCoupon = Partial<TCreateCoupon>;
