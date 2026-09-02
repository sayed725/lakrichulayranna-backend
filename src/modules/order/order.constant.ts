import { Prisma } from "../../generated/client";


export const orderSearchableFields = ['orderNumber', 'couponCode', 'user.name', 'user.email', 'user.phone', 'customerPhone' , 'customerName' , 'customerEmail' ];

export const orderFilterableFields = ['status', 'paymentMethod', 'paymentStatus', 'subtotal', 'total', 'discountAmount', 'deliveryCharge', 'isInsideDhaka', 'isDeleted', 'userId'];

export const orderIncludeConfig: Prisma.OrderInclude = {
  items: {
    include: {
      item: true,
    },
  },
  user: {
    select: { name: true, phone: true, email: true },
  },
};
