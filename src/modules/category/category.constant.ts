import { Prisma } from "../../generated/client";

export const categorySearchableFields = ['name', 'description'];

export const categoryFilterableFields = ['isActive', 'isFeatured'];

export const categoryIncludeConfig: Prisma.CategoryInclude = {
  _count: {
    select: { items: true },
  }
};
