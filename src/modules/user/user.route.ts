import express from 'express';
import { UserController } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';
import auth from '../../middlewares/auth';
import admin from '../../middlewares/admin';

const router = express.Router();

router.get('/profile', auth, UserController.getMyProfile);
router.patch('/profile', auth, validateRequest(UserValidation.updateProfileSchema), UserController.updateProfile);
router.patch('/change-password', auth, validateRequest(UserValidation.changePasswordSchema), UserController.changePassword);

router.get('/', auth, admin, UserController.getAllUsers);
router.patch('/:id/status', auth, admin, validateRequest(UserValidation.updateUserStatusSchema), UserController.updateUserStatus);
router.delete('/:id', auth, admin, UserController.deleteUser);

export const UserRoutes = router;
