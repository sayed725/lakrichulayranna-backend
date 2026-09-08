import { Prisma } from "../../generated/client";

export const reviewSearchableFields = ['comment', 'user.name', 'user.email', 'reviewerName', 'reviewerEmail'];

export const reviewFilterableFields = ['rating', 'isApproved', 'isFeatured', 'isDeleted', 'itemId', 'userId'];

export const reviewIncludeConfig: Prisma.ReviewInclude = {
  user: {
    select: { id: true, name: true, email: true, phone: true },
  },
  item: {
    select: { id: true, name: true, slug: true, imageUrl: true },
  },
};
