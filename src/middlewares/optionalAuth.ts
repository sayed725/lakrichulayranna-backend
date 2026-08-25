import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import catchAsync from '../utils/catchAsync';
import { RoleType } from '../constants/roles';
import { prisma } from '../server';

const optionalAuth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1] as string;

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as unknown as JwtPayload & { userId: string; role: RoleType; email: string };

    // Fetch user from database to check status
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, status: true, isDeleted: true },
    });

    if (user && !user.isDeleted && user.status !== 'BANNED') {
      req.user = { ...decoded, status: user.status };
    }
  } catch (err) {
    // If token is invalid or expired, ignore it and let it proceed as a guest
  }
  next();
});

export default optionalAuth;
