import express from 'express';
import { SettingController } from './setting.controller';
import validateRequest from '../../middlewares/validateRequest';
import { SettingValidation } from './setting.validation';
import auth from '../../middlewares/auth';
import admin from '../../middlewares/admin';

const router = express.Router();

router.get('/', SettingController.getSettings);
router.patch('/', auth, admin, validateRequest(SettingValidation.updateSettingSchema), SettingController.updateSettings);

export const SettingRoutes = router;
