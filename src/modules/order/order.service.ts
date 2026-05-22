import { prisma } from '../../server';
import AppError from '../../errors/AppError';
import { TCreateOrder } from './order.interface';
import { generateOrderNumber } from '../../utils/generateOrderNumber';
import { generateInvoicePdf } from '../../utils/invoiceGenerator';
import { calculatePagination } from '../../utils/pagination';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { IQueryParams } from '../../interfaces/query.interface';
import { orderFilterableFields, orderIncludeConfig, orderSearchableFields } from './order.constant';

const createOrder = async (userId: string, payload: TCreateOrder) => {
  const { items, couponCode, paymentMethod, deliveryAddress, notes } = payload;

  let subtotal = 0;
  const orderItemsData = [];

  for (const item of items) {
    const product = await prisma.item.findUnique({ where: { id: item.itemId } });
    if (!product || !product.isAvailable) {
      throw new AppError(400, `Item ${item.itemId} is unavailable or does not exist`);
    }

    const price = product.discountPrice ?? product.price;
    const total = price * item.quantity;
    subtotal += total;

    orderItemsData.push({
      itemId: product.id,
      itemName: product.name,
      itemPrice: price,
      quantity: item.quantity,
      total,
    });
  }

  let discountAmount = 0;
  let couponId = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.isActive) {
      if (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) {
        if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
          couponId = coupon.id;
          discountAmount = coupon.discountType === 'FIXED' 
            ? Math.min(subtotal, coupon.discountValue) 
            : (subtotal * coupon.discountValue) / 100;
          
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }
  }

  const totalAmount = subtotal - discountAmount;
  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      subtotal,
      discountAmount,
      total: totalAmount,
      couponId,
      couponCode: couponCode ?? null,
      paymentMethod,
      deliveryAddress,
      notes: notes ?? null,
      items: {
        create: orderItemsData,
      },
    },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
    },
  });

  generateInvoicePdf(order).then(async (pdfPath) => {
    await prisma.order.update({
      where: { id: order.id },
      data: { invoicePdf: pdfPath },
    });
  }).catch((err) => console.error('Failed to generate PDF invoice:', err));

  return order;
};

const getMyOrders = async (userId: string, queries: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.order, queries, {
    searchableFields: orderSearchableFields,
    filterableFields: orderFilterableFields,
  })
    .where({ userId })
    .search()
    .filter()
    .sort()
    .paginate()
    .include({ items: true });

  const result = await queryBuilder.execute();
  return result;
};

const getOrderById = async (id: string, userId: string, role: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { id: true, name: true, email: true } } },
  });

  if (!order) throw new AppError(404, 'Order not found');
  if (role !== 'ADMIN' && order.userId !== userId) throw new AppError(403, 'Forbidden');

  return order;
};

const getAllOrders = async (queries: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.order, queries, {
    searchableFields: orderSearchableFields,
    filterableFields: orderFilterableFields,
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .include(orderIncludeConfig);

  const result = await queryBuilder.execute();
  return result;
};

const updateOrderStatus = async (id: string, status: any) => {
  return await prisma.order.update({
    where: { id },
    data: { status },
  });
};

export const OrderService = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
