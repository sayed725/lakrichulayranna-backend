import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OrderService } from './order.service';
import { IQueryParams } from '../../interfaces/query.interface';

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId || null;
  const result = await OrderService.createOrder(userId, req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Order created', data: result });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getMyOrders(req.user.userId, req.query as unknown as IQueryParams);
  sendResponse(res, { statusCode: 200, success: true, message: 'My orders retrieved', meta: result.meta, data: result.data });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getOrderById(req.params.id as string, req.user.userId, req.user.role);
  sendResponse(res, { statusCode: 200, success: true, message: 'Order retrieved', data: result });
});

const getOrderNumber = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getOrderNumber(req.params.orderNumber as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Order retrieved', data: result });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getAllOrders(req.query as unknown as IQueryParams);
  sendResponse(res, { statusCode: 200, success: true, message: 'All orders retrieved', meta: result.meta, data: result.data });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.updateOrderStatus(req.params.id as string, req.body.status);
  sendResponse(res, { statusCode: 200, success: true, message: 'Order status updated', data: result });
});

const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.deleteOrder(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Order deleted successfully', data: result });
});

const updateOrderItems = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.updateOrderItems(req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Order items updated successfully', data: result });
});

const updateOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.updateOrder(req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Order updated successfully', data: result });
});

export const OrderController = {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderNumber,
  getAllOrders,
  deleteOrder,
  updateOrder,
  updateOrderItems,
  updateOrderStatus,
};
