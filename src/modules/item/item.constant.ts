import { Prisma } from "../../generated/client";

export const itemSearchableFields = ['name', 'slug', 'category.name', 'category.slug'];

export const itemFilterableFields = ['isDeleted', 'isFeatured', 'isSpicy', 'weight', 'isActive', 'price', 'category.id', 'category.name', 'category.slug'];

export const itemIncludeConfig: Prisma.ItemInclude = {
  category: true,
};
