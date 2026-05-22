import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import AppError from '../errors/AppError';
import catchAsync from '../utils/catchAsync';
import { Messages } from '../constants/messages';
import { RoleType } from '../constants/roles';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload & { userId: string; role: RoleType; email: string };
    }
  }
}

const auth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, Messages.UNAUTHORIZED);
  }

  const token = authHeader.split(' ')[1] as string;

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as unknown as JwtPayload & { userId: string; role: RoleType; email: string };
    req.user = decoded;
    next();
  } catch (err) {
    throw new AppError(401, 'Invalid token or expired');
  }
});

export default auth;
