import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CouponService } from './coupon.service';
import { calculateDiscount } from '../../utils/calculateDiscount';
import { IQueryParams } from '../../interfaces/query.interface';

const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.createCoupon(req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Coupon created', data: result });
});

const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.getAllCoupons(req.query as unknown as IQueryParams);
  sendResponse(res, { statusCode: 200, success: true, message: 'Coupons retrieved', meta: result.meta, data: result.data });
});

const validateCoupon = catchAsync(async (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  const coupon = await CouponService.validateCoupon(code, subtotal);
  
  const discountAmount = calculateDiscount(subtotal, coupon.discountType, coupon.discountValue);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Coupon is valid',
    data: { coupon, discountAmount },
  });
});

const updateCoupon = catchAsync(async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const result = await CouponService.updateCoupon(id, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Coupon updated', data: result });
});

const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  await CouponService.deleteCoupon(id);
  sendResponse(res, { statusCode: 200, success: true, message: 'Coupon deleted', data: null });
});

export const CouponController = {
  createCoupon,
  getAllCoupons,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
};
