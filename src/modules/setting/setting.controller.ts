import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SettingService } from './setting.service';

const getSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await SettingService.getSettings();
  sendResponse(res, { statusCode: 200, success: true, message: 'Settings retrieved', data: result });
});

const updateSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await SettingService.updateSettings(req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Settings updated', data: result });
});

export const SettingController = {
  getSettings,
  updateSettings,
};
