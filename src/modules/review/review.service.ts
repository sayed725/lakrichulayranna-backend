import { prisma } from '../../server';
import AppError from '../../errors/AppError';
import { TCreateReview } from './review.interface';
import { calculatePagination } from '../../utils/pagination';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { IQueryParams } from '../../interfaces/query.interface';
import { reviewFilterableFields, reviewIncludeConfig, reviewSearchableFields } from './review.constant';

const createReview = async (userId: string | undefined, payload: TCreateReview) => {
  if (userId) {
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
        itemId: payload.itemId,
        rating: payload.rating,
        comment: payload.comment ?? null,
      },
    });
  } else {
    if (!payload.reviewerName || !payload.reviewerEmail) {
      throw new AppError(400, 'Name and email are required for guest reviews');
    }

    const orderItem = await prisma.orderItem.findFirst({
      where: {
        itemId: payload.itemId,
        order: {
          customerEmail: {
            equals: payload.reviewerEmail,
            mode: 'insensitive',
          },
          status: 'DELIVERED',
        },
      },
    });

    if (!orderItem) {
      throw new AppError(403, 'You can only review items you have ordered and received');
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerEmail: {
          equals: payload.reviewerEmail,
          mode: 'insensitive',
        },
        itemId: payload.itemId,
        userId: null,
      },
    });

    if (existingReview) {
      throw new AppError(409, 'You have already reviewed this item');
    }

    return await prisma.review.create({
      data: {
        reviewerName: payload.reviewerName,
        reviewerEmail: payload.reviewerEmail,
        itemId: payload.itemId,
        rating: payload.rating,
        comment: payload.comment ?? null,
      },
    });
  }
};

const getItemReviews = async (itemId: string, queries: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.review, queries, {
    searchableFields: reviewSearchableFields,
    filterableFields: reviewFilterableFields,
  })
    .where({ itemId, isApproved: true, isDeleted: false })
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
    .where({ isDeleted: false })
    .search()
    .filter()
    .sort()
    .paginate()
    .include(reviewIncludeConfig);

  const result = await queryBuilder.execute();
  return result;
};

const updateReviewStatus = async (id: string, status: string) => {
  const updateData: Record<string, boolean> = {};

  switch (status) {
    case 'approve':
      updateData.isApproved = true;
      break;
    case 'unapprove':
      updateData.isApproved = false;
      break;
    case 'feature':
      updateData.isFeatured = true;
      break;
    case 'unfeature':
      updateData.isFeatured = false;
      break;
    default:
      throw new AppError(400, 'Invalid status. Valid statuses: approve, unapprove, feature, unfeature');
  }

  return await prisma.review.update({
    where: { id },
    data: updateData,
  });
};

const deleteReview = async (id: string) => {
  return await prisma.review.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
};

const getMyReviews = async (userId: string, queries: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.review, queries, {
    searchableFields: reviewSearchableFields,
    filterableFields: reviewFilterableFields,
  })
    .where({ userId, isDeleted: false })
    .sort()
    .paginate()
    .include(reviewIncludeConfig);

  const result = await queryBuilder.execute();
  return result;
};

const updateMyReview = async (userId: string, reviewId: string, payload: { rating?: number, comment?: string }) => {
  const review = await prisma.review.findFirst({
    where: { id: reviewId, userId },
  });

  if (!review) {
    throw new AppError(404, 'Review not found or you do not have permission to update it');
  }

  return await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...payload,
      isApproved: false, // Re-require approval on update
    },
  });
};

const deleteMyReview = async (userId: string, reviewId: string) => {
  const review = await prisma.review.findFirst({
    where: { id: reviewId, userId },
  });

  if (!review) {
    throw new AppError(404, 'Review not found or you do not have permission to delete it');
  }

  return await prisma.review.update({
    where: { id: reviewId },
    data: { isDeleted: true, deletedAt: new Date() },
  });
};

export const ReviewService = {
  createReview,
  getItemReviews,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  getMyReviews,
  updateMyReview,
  deleteMyReview,
};
