import { Prisma } from "../../generated/client";

export const itemSearchableFields = ['name', 'slug', 'category.name', 'category.slug'];

export const itemFilterableFields = ['isDeleted', 'isFeatured', 'isBestSelling', 'isSpicy', 'weight', 'isAvailable', 'price', 'category.id', 'category.name', 'category.slug'];

export const itemIncludeConfig: Prisma.ItemInclude = {
  category: true,
};
