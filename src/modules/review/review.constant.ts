import { Prisma } from "@prisma/client";

export const reviewSearchableFields = ['comment', 'user.name'];

export const reviewFilterableFields = ['rating', 'isApproved', 'isFeatured', 'isDeleted', 'itemId', 'userId'];

export const reviewIncludeConfig: Prisma.ReviewInclude = {
  user: {
    select: { name: true },
  },
  item: {
    select: { name: true, slug: true },
  },
};
