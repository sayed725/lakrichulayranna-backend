import express from 'express';
import { SettingController } from './setting.controller';
import validateRequest from '../../middlewares/validateRequest';
import { SettingValidation } from './setting.validation';
import auth from '../../middlewares/auth';
import admin from '../../middlewares/admin';
import { adminLimiter } from '../../middlewares/rateLimiter';

const router = express.Router();

router.get('/', SettingController.getSettings);
router.patch('/', auth, admin, adminLimiter, validateRequest(SettingValidation.updateSettingSchema), SettingController.updateSettings);

export const SettingRoutes = router;
