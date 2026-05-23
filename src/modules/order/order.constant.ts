import { Prisma } from "@prisma/client";


export const orderSearchableFields = ['orderNumber', 'couponCode', 'user.name', 'user.email'];

export const orderFilterableFields = ['status', 'paymentMethod', 'paymentStatus', 'userId'];

export const orderIncludeConfig: Prisma.OrderInclude = {
  items: true,
  user: {
    select: { name: true, phone: true, email: true },
  },
};
