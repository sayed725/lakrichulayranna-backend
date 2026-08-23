import { prisma } from '../../server';
import AppError from '../../errors/AppError';
import { hashPassword, comparePassword } from '../../utils/bcrypt';
import { TUpdateProfile } from './user.interface';
import { calculatePagination } from '../../utils/pagination';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { IQueryParams } from '../../interfaces/query.interface';
import { userFilterableFields, userSearchableFields } from './user.constant';

const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      address: true,
      createdAt: true,
    },
  });
  if (!user) throw new AppError(404, 'User not found');
  return user;
};

const updateProfile = async (userId: string, payload: TUpdateProfile) => {
  // Destructure to prevent role manipulation from frontend
  const { role, ...updateData } = payload as any;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      updatedAt: true,
    },
  });
  return user;
};

const changePassword = async (userId: string, payload: any) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'User not found');

  const isMatched = await comparePassword(payload.oldPassword, user.password);
  if (!isMatched) throw new AppError(400, 'Incorrect old password');

  const hashedNewPassword = await hashPassword(payload.newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  return null;
};

const getAllUsers = async (queries: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.user, queries, {
    searchableFields: userSearchableFields,
    filterableFields: userFilterableFields,
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .omit({ password: true })
    .include({ _count: { select: { orders: true } } }); // Add this;

  const result = await queryBuilder.execute();
  return result;
};

const deleteUser = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { isDeleted: true, deletedAt: new Date() },
  });
  return null;
};

const updateUserStatus = async (userId: string, status: string) => {
  // Check if user exists and get current role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  // Prevent changing status for admin users
  if (user.role === 'ADMIN') {
    throw new AppError(403, 'Cannot change status for admin users');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: status as any },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });
  return updatedUser;
};

export const UserService = {
  getMyProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  deleteUser,
  updateUserStatus,
};
