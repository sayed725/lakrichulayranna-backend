import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { RoleType } from '../constants/roles';
import { prisma } from '../server';

const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // If no auth header, proceed without user (guest checkout)
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

    if (!user || user.isDeleted) {
      return next(); // Proceed without user if token is invalid
    }

    if (user.status === 'BANNED') {
      return next(); // Proceed without user if user is banned
    }

    req.user = { ...decoded, status: user.status };
    next();
  } catch (err) {
    // If token is invalid/expired, proceed without user (guest checkout)
    next();
  }
};

export default optionalAuth;
