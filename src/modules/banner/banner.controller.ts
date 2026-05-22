import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BannerService } from './banner.service';
import { IQueryParams } from '../../interfaces/query.interface';

const createBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await BannerService.createBanner(req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Banner created', data: result });
});

const getAllBanners = catchAsync(async (req: Request, res: Response) => {
  const result = await BannerService.getAllBanners(req.query as unknown as IQueryParams);
  sendResponse(res, { statusCode: 200, success: true, message: 'Banners retrieved', meta: result.meta, data: result.data });
});

const updateBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await BannerService.updateBanner(req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Banner updated', data: result });
});

const deleteBanner = catchAsync(async (req: Request, res: Response) => {
  await BannerService.deleteBanner(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Banner deleted', data: null });
});

const toggleBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await BannerService.toggleBanner(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Banner status toggled', data: result });
});

export const BannerController = {
  createBanner,
  getAllBanners,
  updateBanner,
  deleteBanner,
  toggleBanner,
};
