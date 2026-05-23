import { prisma } from '../../server';
import AppError from '../../errors/AppError';
import { hashPassword, comparePassword } from '../../utils/bcrypt';
import { createToken, verifyAuthToken } from './auth.utils';
import { env } from '../../config/env';

const registerUser = async (payload: any) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(409, 'User with this email already exists');
  }

  const hashedPassword = await hashPassword(payload.password);
  
  const newUser = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
  });

  const { password, ...userWithoutPassword } = newUser;

  const jwtPayload = {
    userId: newUser.id,
    role: newUser.role,
    email: newUser.email,
  };

  const accessToken = createToken(
    jwtPayload,
    env.JWT_SECRET,
    env.JWT_EXPIRES_IN
  );

  const refreshToken = createToken(
    jwtPayload,
    env.JWT_SECRET,
    '7d'
  );

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: any) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const isPasswordMatched = await comparePassword(payload.password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(401, 'Invalid credentials');
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
    email: user.email,
  };

  const accessToken = createToken(
    jwtPayload,
    env.JWT_SECRET,
    env.JWT_EXPIRES_IN
  );

  const refreshToken = createToken(
    jwtPayload,
    env.JWT_SECRET,
    '7d'
  );

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  let decoded;
  try {
    decoded = verifyAuthToken(token, env.JWT_SECRET) as any;
  } catch (error) {
    throw new AppError(401, 'Invalid refresh token');
  }

  const user = await prisma.user.findUnique({
    where: { email: decoded.email },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
    email: user.email,
  };

  const accessToken = createToken(
    jwtPayload,
    env.JWT_SECRET,
    env.JWT_EXPIRES_IN
  );

  return {
    accessToken,
  };
};

const getMe = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
};

export const AuthService = {
  registerUser,
  loginUser,
  refreshToken,
  getMe,
};
