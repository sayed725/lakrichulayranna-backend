import express from 'express';
import { UserController } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';
import auth from '../../middlewares/auth';
import admin from '../../middlewares/admin';
import { adminLimiter } from '../../middlewares/rateLimiter';

const router = express.Router();

router.get('/profile', auth, UserController.getMyProfile);
router.patch('/profile', auth, validateRequest(UserValidation.updateProfileSchema), UserController.updateProfile);
router.patch('/change-password', auth, validateRequest(UserValidation.changePasswordSchema), UserController.changePassword);

router.get('/', auth, admin, adminLimiter, UserController.getAllUsers);
router.patch('/:id/status', auth, admin, adminLimiter, validateRequest(UserValidation.updateUserStatusSchema), UserController.updateUserStatus);
router.delete('/:id', auth, admin, adminLimiter, UserController.deleteUser);

export const UserRoutes = router;
