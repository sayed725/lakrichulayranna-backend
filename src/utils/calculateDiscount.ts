import { DiscountType } from "@prisma/client";


export const calculateDiscount = (
  subtotal: number,
  discountType: DiscountType,
  discountValue: number
): number => {
  if (discountType === 'FIXED') {
    return Math.min(subtotal, discountValue);
  } else if (discountType === 'PERCENTAGE') {
    return (subtotal * discountValue) / 100;
  }
  return 0;
};
