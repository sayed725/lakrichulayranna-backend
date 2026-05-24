import { z } from 'zod';
import { PaymentMethod, OrderStatus } from "../../generated/client";

const createOrderSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      itemId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })).min(1, 'Order must contain at least one item'),
    couponCode: z.string().optional(),
    paymentMethod: z.enum([PaymentMethod.COD, PaymentMethod.ONLINE]),
    deliveryAddress: z.record(z.string(), z.any()),
    notes: z.string().optional(),
  }),
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
    ]),
  }),
});

export const OrderValidation = {
  createOrderSchema,
  updateOrderStatusSchema,
};
