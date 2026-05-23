import { prisma } from '../../server';
import AppError from '../../errors/AppError';
import { TCreateCoupon, TUpdateCoupon } from './coupon.interface';
import { IQueryParams } from '../../interfaces/query.interface';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { couponSearchableFields, couponFilterableFields, couponIncludeConfig } from './coupon.constant';

const createCoupon = async (payload: TCreateCoupon) => {
  const isExist = await prisma.coupon.findUnique({ where: { code: payload.code } });
  if (isExist) throw new AppError(409, 'Coupon code already exists');

  return await prisma.coupon.create({ 
    data: {
      ...payload,
      discountType: payload.discountType || 'FIXED',
    }
  });
};

const getAllCoupons = async (queries: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.coupon, queries, {
    searchableFields: couponSearchableFields,
    filterableFields: couponFilterableFields,
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .include(couponIncludeConfig);

  const result = await queryBuilder.execute();
  return result;
};

const validateCoupon = async (code: string, subtotal: number) => {
  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon) throw new AppError(404, 'Invalid coupon code');
  if (!coupon.isActive) throw new AppError(400, 'Coupon is inactive');
  if (coupon.isDeleted) throw new AppError(400, 'Coupon is deleted');
  if (new Date(coupon.expiryDate) < new Date()) throw new AppError(400, 'Coupon is expired');
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new AppError(400, 'Coupon usage limit reached');
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    throw new AppError(400, `Minimum order amount of ${coupon.minOrderAmount} required for this coupon`);
  }

  return coupon;
};

const updateCoupon = async (id: string, payload: TUpdateCoupon) => {
  return await prisma.coupon.update({
    where: { id },
    data: payload,
  });
};

const deleteCoupon = async (id: string) => {
  return await prisma.coupon.delete({ where: { id } });
};

export const CouponService = {
  createCoupon,
  getAllCoupons,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
};
