import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.service';
import { IQueryParams } from '../../interfaces/query.interface';

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getMyProfile(req.user.userId);
  sendResponse(res, { statusCode: 200, success: true, message: 'Profile retrieved', data: result });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateProfile(req.user.userId, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Profile updated', data: result });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  await UserService.changePassword(req.user.userId, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Password changed successfully', data: null });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query as unknown as IQueryParams);
  sendResponse(res, { statusCode: 200, success: true, message: 'Users retrieved', meta: result.meta, data: result.data });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  await UserService.deleteUser(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'User deleted', data: null });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateUserStatus(req.params.id as string, req.body.status);
  sendResponse(res, { statusCode: 200, success: true, message: 'User status updated', data: result });
});

export const UserController = {
  getMyProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  deleteUser,
  updateUserStatus,
};
