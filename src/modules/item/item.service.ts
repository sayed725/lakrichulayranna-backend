import { prisma } from '../../server';
import AppError from '../../errors/AppError';
import { TCreateItem, TUpdateItem } from './item.interface';
import { generateSlug } from '../../utils/generateSlug';
import { calculatePagination } from '../../utils/pagination';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { Prisma } from '@prisma/client';

import { itemFilterableFields, itemIncludeConfig, itemSearchableFields } from './item.constant';
import { IQueryParams } from '../../interfaces/query.interface';

const createItem = async (payload: TCreateItem) => {
  let slug = generateSlug(payload.name);
  let isExist = await prisma.item.findUnique({ where: { slug } });
  let counter = 1;
  while (isExist) {
    slug = `${generateSlug(payload.name)}-${counter}`;
    isExist = await prisma.item.findUnique({ where: { slug } });
    counter++;
  }

  return await prisma.item.create({
    data: {
      ...payload,
      slug,
    },
  });
};

const getAllItems = async (queries: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.item, queries, {
    searchableFields: itemSearchableFields,
    filterableFields: itemFilterableFields,
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .include(itemIncludeConfig);

  const result = await queryBuilder.execute();
  return result;
};

const getItemBySlug = async (slug: string) => {
  const item = await prisma.item.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!item) throw new AppError(404, 'Item not found');
  return item;
};

const updateItem = async (id: string, payload: TUpdateItem) => {
  return await prisma.item.update({
    where: { id },
    data: payload,
  });
};

const deleteItem = async (id: string) => {
  return await prisma.item.delete({ where: { id } });
};

const toggleAvailability = async (id: string) => {
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) throw new AppError(404, 'Item not found');

  return await prisma.item.update({
    where: { id },
    data: { isAvailable: !item.isAvailable },
  });
};

export const ItemService = {
  createItem,
  getAllItems,
  getItemBySlug,
  updateItem,
  deleteItem,
  toggleAvailability,
};
