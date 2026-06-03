import express from 'express';
import { BannerController } from './banner.controller';
import validateRequest from '../../middlewares/validateRequest';
import { BannerValidation } from './banner.validation';
import auth from '../../middlewares/auth';
import admin from '../../middlewares/admin';
import { adminLimiter } from '../../middlewares/rateLimiter';

const router = express.Router();

router.get('/', BannerController.getAllBanners);
router.post('/', auth, admin, adminLimiter, validateRequest(BannerValidation.createBannerSchema), BannerController.createBanner);
router.patch('/:id', auth, admin, adminLimiter, validateRequest(BannerValidation.updateBannerSchema), BannerController.updateBanner);
router.delete('/:id', auth, admin, adminLimiter, BannerController.deleteBanner);

export const BannerRoutes = router;
