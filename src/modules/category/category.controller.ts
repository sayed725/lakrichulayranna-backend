import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CategoryService } from './category.service';
import { IQueryParams } from '../../interfaces/query.interface';

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.createCategory(req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Category created', data: result });
});

const getCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getCategories(req.query as unknown as IQueryParams);
  sendResponse(res, { statusCode: 200, success: true, message: 'Categories retrieved successfully', meta: result.meta, data: result.data });
});

const getCategoryBySlug = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getCategoryBySlug(req.params.slug as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Category retrieved successfully', data: result });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.updateCategory(req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Category updated successfully', data: result });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  await CategoryService.deleteCategory(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Category deleted', data: null });
});

export const CategoryController = {
  createCategory,
  getCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};
