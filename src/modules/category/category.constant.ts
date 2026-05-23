import { Prisma } from "@prisma/client";

export const categorySearchableFields = ['name', 'description'];

export const categoryFilterableFields = ['isActive'];

export const categoryIncludeConfig: Prisma.CategoryInclude = {
  _count: {
    select: { items: true },
  }
};
