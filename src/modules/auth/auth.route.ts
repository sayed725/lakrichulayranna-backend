import express from 'express';
import { AuthController } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidation } from './auth.validation';
import { authLimiter } from '../../middlewares/rateLimiter';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.registerUser
);

router.post(
  '/login',
  authLimiter,
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.loginUser
);

router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthController.refreshToken
);

router.post(
  '/logout',
  AuthController.logout
);

router.get(
  '/me',
  auth,
  AuthController.getMe
);

export const AuthRoutes = router;
