import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReviewService } from './review.service';
import { IQueryParams } from '../../interfaces/query.interface';

const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.createReview(req.user.userId, req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Review created and pending approval', data: result });
});

const getItemReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getItemReviews(req.params.itemId as string, req.query as unknown as IQueryParams);
  sendResponse(res, { statusCode: 200, success: true, message: 'Reviews retrieved', meta: result.meta, data: result.data });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getAllReviews(req.query as unknown as IQueryParams);
  sendResponse(res, { statusCode: 200, success: true, message: 'All reviews retrieved', meta: result.meta, data: result.data });
});

const updateReviewStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.updateReviewStatus(req.params.id as string, req.params.status as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Review status updated', data: result });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  await ReviewService.deleteReview(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Review deleted', data: null });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getMyReviews(req.user.userId, req.query as unknown as IQueryParams);
  sendResponse(res, { statusCode: 200, success: true, message: 'My reviews retrieved', meta: result.meta, data: result.data });
});

const updateMyReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.updateMyReview(req.user.userId, req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Review updated successfully', data: result });
});

const deleteMyReview = catchAsync(async (req: Request, res: Response) => {
  await ReviewService.deleteMyReview(req.user.userId, req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Review deleted successfully', data: null });
});

export const ReviewController = {
  createReview,
  getItemReviews,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  getMyReviews,
  updateMyReview,
  deleteMyReview,
};
