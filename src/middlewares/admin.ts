import { Request, Response, NextFunction } from 'express';
import AppError from '../errors/AppError';
import { Roles } from '../constants/roles';
import { Messages } from '../constants/messages';
import catchAsync from '../utils/catchAsync';

const admin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (req.user.role !== Roles.ADMIN) {
    throw new AppError(403, Messages.FORBIDDEN);
  }
  next();
});

export default admin;
