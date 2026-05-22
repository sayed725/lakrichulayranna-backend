import express from 'express';
import { OrderController } from './order.controller';
import validateRequest from '../../middlewares/validateRequest';
import { OrderValidation } from './order.validation';
import auth from '../../middlewares/auth';
import admin from '../../middlewares/admin';

const router = express.Router();

router.post('/', auth, validateRequest(OrderValidation.createOrderSchema), OrderController.createOrder);
router.get('/my-orders', auth, OrderController.getMyOrders);
router.get('/:id', auth, OrderController.getOrderById);

router.get('/', auth, admin, OrderController.getAllOrders);
router.patch('/:id/status', auth, admin, validateRequest(OrderValidation.updateOrderStatusSchema), OrderController.updateOrderStatus);

export const OrderRoutes = router;
