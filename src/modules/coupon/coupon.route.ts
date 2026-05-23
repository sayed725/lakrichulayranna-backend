import express from 'express';
import { CouponController } from './coupon.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CouponValidation } from './coupon.validation';
import auth from '../../middlewares/auth';
import admin from '../../middlewares/admin';
import { z } from 'zod';

const router = express.Router();

router.post(
  '/validate',
  auth,
  validateRequest(z.object({ body: z.object({ code: z.string(), subtotal: z.number().positive() }) })),
  CouponController.validateCoupon
);

router.get('/',CouponController.getAllCoupons);
router.post('/', auth, admin, validateRequest(CouponValidation.createCouponSchema), CouponController.createCoupon);
router.patch('/:id', auth, admin, validateRequest(CouponValidation.updateCouponSchema), CouponController.updateCoupon);
router.delete('/:id', auth, admin, CouponController.deleteCoupon);

export const CouponRoutes = router;
