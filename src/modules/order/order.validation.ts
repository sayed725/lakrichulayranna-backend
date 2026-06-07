import { z } from 'zod';
import { PaymentMethod, OrderStatus, PaymentStatus } from "../../generated/client";

const createOrderSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      itemId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })).min(1, 'Order must contain at least one item'),
    couponCode: z.string().optional(),
    paymentMethod: z.enum([PaymentMethod.COD, PaymentMethod.ONLINE]),
    deliveryAddress: z.object({
      area: z.string().min(1, 'Area is required'),
      city: z.string().min(1, 'City is required'),
      street: z.string().min(1, 'Street is required'),
      country: z.string().min(1, 'Country is required'),
    }),
    isInsideDhaka: z.boolean().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    customerEmail: z.string().email().optional(),
    deliveryCharge: z.number().nonnegative().optional(),
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

const updateOrderItemsSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      itemId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })).min(1, 'Order must contain at least one item'),
  }),
});

const updateOrderSchema = z.object({
  body: z.object({
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    customerEmail: z.string().email().optional(),
    deliveryAddress: z.object({
      area: z.string().min(1, 'Area is required'),
      city: z.string().min(1, 'City is required'),
      street: z.string().min(1, 'Street is required'),
      country: z.string().min(1, 'Country is required'),
    }).optional(),
    isInsideDhaka: z.boolean().optional(),
    deliveryCharge: z.number().nonnegative().optional(),
    notes: z.string().optional(),
    status: z.enum([
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
    ]).optional(),
    paymentStatus: z.enum([
      PaymentStatus.PENDING,
      PaymentStatus.PAID,
      PaymentStatus.FAILED,
    ]).optional(),
  }),
});

export const OrderValidation = {
  createOrderSchema,
  updateOrderStatusSchema,
  updateOrderItemsSchema,
  updateOrderSchema,
};
