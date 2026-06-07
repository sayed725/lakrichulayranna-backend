import express from 'express';
import { OrderController } from './order.controller';
import validateRequest from '../../middlewares/validateRequest';
import { OrderValidation } from './order.validation';
import auth from '../../middlewares/auth';
import optionalAuth from '../../middlewares/optionalAuth';
import admin from '../../middlewares/admin';
import { orderLimiter, adminLimiter } from '../../middlewares/rateLimiter';

const router = express.Router();

router.post('/', orderLimiter, optionalAuth, validateRequest(OrderValidation.createOrderSchema), OrderController.createOrder);
router.get('/my-orders', auth, OrderController.getMyOrders);
router.get('/number/:orderNumber', OrderController.getOrderNumber);
router.get('/:id', auth, OrderController.getOrderById);

router.get('/', auth, admin, adminLimiter, OrderController.getAllOrders);
router.patch('/:id/status', auth, admin, adminLimiter, validateRequest(OrderValidation.updateOrderStatusSchema), OrderController.updateOrderStatus);
router.patch('/:id', auth, admin, adminLimiter, validateRequest(OrderValidation.updateOrderSchema), OrderController.updateOrder);
router.put('/:id/items', auth, admin, adminLimiter, validateRequest(OrderValidation.updateOrderItemsSchema), OrderController.updateOrderItems);
router.delete('/:id', auth, admin, adminLimiter, OrderController.deleteOrder);

export const OrderRoutes = router;
