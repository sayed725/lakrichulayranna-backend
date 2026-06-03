import express from 'express';
import { OrderController } from './order.controller';
import validateRequest from '../../middlewares/validateRequest';
import { OrderValidation } from './order.validation';
import auth from '../../middlewares/auth';
import admin from '../../middlewares/admin';
import { orderLimiter, adminLimiter } from '../../middlewares/rateLimiter';

const router = express.Router();

router.post('/', auth, orderLimiter, validateRequest(OrderValidation.createOrderSchema), OrderController.createOrder);
router.get('/my-orders', auth, OrderController.getMyOrders);
router.get('/:id', auth, OrderController.getOrderById);

router.get('/', auth, admin, adminLimiter, OrderController.getAllOrders);
router.patch('/:id/status', auth, admin, adminLimiter, validateRequest(OrderValidation.updateOrderStatusSchema), OrderController.updateOrderStatus);

export const OrderRoutes = router;
