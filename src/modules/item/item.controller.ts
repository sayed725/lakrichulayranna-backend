import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ItemService } from './item.service';
import { IQueryParams } from '../../interfaces/query.interface';

const createItem = catchAsync(async (req: Request, res: Response) => {
  const result = await ItemService.createItem(req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Item created', data: result });
});

const getAllItems = catchAsync(async (req: Request, res: Response) => {
  const result = await ItemService.getAllItems(req.query as unknown as IQueryParams);
  sendResponse(res, { statusCode: 200, success: true, message: 'Items retrieved', meta: result.meta, data: result.data });
});

const getItemBySlug = catchAsync(async (req: Request, res: Response) => {
  const result = await ItemService.getItemBySlug(req.params.slug as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Item retrieved', data: result });
});

const updateItem = catchAsync(async (req: Request, res: Response) => {
  const result = await ItemService.updateItem(req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Item updated', data: result });
});

const deleteItem = catchAsync(async (req: Request, res: Response) => {
  await ItemService.deleteItem(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Item deleted', data: null });
});

const toggleAvailability = catchAsync(async (req: Request, res: Response) => {
  const result = await ItemService.toggleAvailability(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Item availability toggled', data: result });
});

export const ItemController = {
  createItem,
  getAllItems,
  getItemBySlug,
  updateItem,
  deleteItem,
  toggleAvailability,
};
