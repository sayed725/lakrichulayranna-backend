import { prisma } from '../../server';
import AppError from '../../errors/AppError';
import { TCreateOrder } from './order.interface';
import { generateOrderNumber } from '../../utils/generateOrderNumber';
import { generateInvoicePdf } from '../../utils/invoiceGenerator';
import { calculatePagination } from '../../utils/pagination';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { IQueryParams } from '../../interfaces/query.interface';
import { orderFilterableFields, orderIncludeConfig, orderSearchableFields } from './order.constant';

const createOrder = async (userId: string | null, payload: TCreateOrder) => {
  const { items, couponCode, paymentMethod, deliveryAddress, isInsideDhaka, customerName, customerPhone, customerEmail, deliveryCharge, notes } = payload;

  // Check user status if userId is provided
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true, isDeleted: true },
    });

    if (!user || user.isDeleted) {
      throw new AppError(404, 'User not found');
    }

    if (user.status === 'INACTIVE') {
      throw new AppError(403, 'You are inactive. Please contact admin to activate your account.');
    }

    if (user.status === 'BANNED') {
      throw new AppError(403, 'You are banned. Please contact admin.');
    }
  }

  let subtotal = 0;
  let totalWeight = 0;
  const orderItemsData = [];

  for (const item of items) {
    const product = await prisma.item.findUnique({ where: { id: item.itemId } });
    if (!product || !product.isAvailable) {
      throw new AppError(400, `Item ${item.itemId} is unavailable or does not exist`);
    }

    const price = product.discountPrice ?? product.price;
    const total = price * item.quantity;
    subtotal += total;

    // Calculate weight (assuming weight is stored as string like "500g", need to parse)
    const weightValue = product.weight ? parseInt(product.weight.replace(/\D/g, '')) || 0 : 0;
    totalWeight += weightValue * item.quantity;

    orderItemsData.push({
      itemId: product.id,
      itemName: product.name,
      itemPrice: price,
      quantity: item.quantity,
      total,
    });
  }

  // Validate total weight (max 5000g)
  if (totalWeight > 5000) {
    throw new AppError(400, 'Order weight cannot exceed 5000g');
  }

  // Calculate delivery charge based on isInsideDhaka
  const baseDeliveryCharge = isInsideDhaka !== undefined ? (isInsideDhaka ? 100 : 150) : 100;

  // Calculate extra charge for weight over 1000g (10tk per 1000g)
  let extraCharge = 0;
  if (totalWeight > 1000) {
    const extraWeight = totalWeight - 1000;
    extraCharge = Math.ceil(extraWeight / 1000) * 10;
  }

  const calculatedDeliveryCharge = baseDeliveryCharge + extraCharge;

  // Use provided delivery charge if specified, otherwise use calculated
  const finalDeliveryCharge = deliveryCharge ?? calculatedDeliveryCharge;

  let discountAmount = 0;
  let couponId = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.isActive && !coupon.isDeleted) {
      if (new Date(coupon.expiryDate) > new Date()) {
        if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
          couponId = coupon.id;
          let discount = coupon.discountType === 'FIXED' 
            ? coupon.discountValue 
            : (subtotal * coupon.discountValue) / 100;
          
          // Apply max discount limit if set
          if (coupon.maxDiscountAmount) {
            discount = Math.min(discount, coupon.maxDiscountAmount);
          }
          
          discountAmount = Math.min(subtotal, discount);
          
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }
  }

  const totalAmount = subtotal - discountAmount + finalDeliveryCharge;
  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      customerName: customerName ?? null,
      customerPhone: customerPhone ?? null,
      customerEmail: customerEmail ?? null,
      subtotal,
      discountAmount,
      deliveryCharge: finalDeliveryCharge,
      total: totalAmount,
      couponId,
      couponCode: couponCode ?? null,
      paymentMethod,
      deliveryAddress,
      isInsideDhaka: isInsideDhaka ?? true,
      notes: notes ?? null,
      items: {
        create: orderItemsData,
      },
    },
    include: {
      items: true,
      user: userId ? { select: { name: true, email: true } } : false,
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
    .include({ items: { include: { item: true } } });

  const result = await queryBuilder.execute();
  return result;
};

const getOrderById = async (id: string, userId: string, role: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { item: true } }, user: { select: { id: true, name: true, email: true, phone: true } } },
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

const getOrderNumber = async (orderNumber: string) => {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: { include: { item: true } }, user: { select: { id: true, name: true, email: true, phone: true } } },
  });

  if (!order) throw new AppError(404, 'Order not found');

  return order;
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
  getOrderNumber,
  getAllOrders,
  updateOrderStatus,
};
