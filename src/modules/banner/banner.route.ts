import express from 'express';
import { BannerController } from './banner.controller';
import validateRequest from '../../middlewares/validateRequest';
import { BannerValidation } from './banner.validation';
import auth from '../../middlewares/auth';
import admin from '../../middlewares/admin';

const router = express.Router();

router.get('/', BannerController.getAllBanners);
router.post('/', auth, admin, validateRequest(BannerValidation.createBannerSchema), BannerController.createBanner);
router.patch('/:id', auth, admin, validateRequest(BannerValidation.updateBannerSchema), BannerController.updateBanner);
router.delete('/:id', auth, admin, BannerController.deleteBanner);

export const BannerRoutes = router;
