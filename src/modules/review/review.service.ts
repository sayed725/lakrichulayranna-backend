import { prisma } from '../../server';
import AppError from '../../errors/AppError';
import { TCreateReview } from './review.interface';
import { calculatePagination } from '../../utils/pagination';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { IQueryParams } from '../../interfaces/query.interface';
import { reviewFilterableFields, reviewIncludeConfig, reviewSearchableFields } from './review.constant';

const createReview = async (userId: string, payload: TCreateReview) => {
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      itemId: payload.itemId,
      order: {
        userId,
        status: 'DELIVERED', 
      },
    },
  });

  if (!orderItem) {
    throw new AppError(403, 'You can only review items you have ordered and received');
  }

  const existingReview = await prisma.review.findFirst({
    where: { userId, itemId: payload.itemId },
  });

  if (existingReview) {
    throw new AppError(409, 'You have already reviewed this item');
  }

  return await prisma.review.create({
    data: {
      userId,
      ...payload,
    },
  });
};

const getItemReviews = async (itemId: string, queries: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.review, queries, {
    searchableFields: reviewSearchableFields,
    filterableFields: reviewFilterableFields,
  })
    .where({ itemId, isApproved: true })
    .search()
    .filter()
    .sort()
    .paginate()
    .include({ user: { select: { name: true } } });

  const result = await queryBuilder.execute();
  return result;
};

const getAllReviews = async (queries: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.review, queries, {
    searchableFields: reviewSearchableFields,
    filterableFields: reviewFilterableFields,
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .include(reviewIncludeConfig);

  const result = await queryBuilder.execute();
  return result;
};

const approveReview = async (id: string) => {
  return await prisma.review.update({
    where: { id },
    data: { isApproved: true },
  });
};

const deleteReview = async (id: string) => {
  return await prisma.review.delete({ where: { id } });
};

export const ReviewService = {
  createReview,
  getItemReviews,
  getAllReviews,
  approveReview,
  deleteReview,
};
