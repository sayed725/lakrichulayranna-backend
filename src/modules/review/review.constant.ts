import { Prisma } from '../../generated';

export const reviewSearchableFields = ['comment', 'user.name'];

export const reviewFilterableFields = ['rating', 'isApproved', 'itemId', 'userId'];

export const reviewIncludeConfig: Prisma.ReviewInclude = {
  user: {
    select: { name: true },
  },
  item: {
    select: { name: true, slug: true },
  },
};
