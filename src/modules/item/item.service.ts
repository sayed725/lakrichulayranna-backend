import { prisma } from '../../server';
import AppError from '../../errors/AppError';
import { TCreateItem, TUpdateItem } from './item.interface';
import { generateSlug } from '../../utils/generateSlug';
import { calculatePagination } from '../../utils/pagination';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { Prisma } from "../../generated/client";

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
    relationConfig: {
      category: 'one',
    },
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .include(itemIncludeConfig);

  const result = await queryBuilder.execute();
  return result;
};

const getItemById = async (id: string) => {
  const item = await prisma.item.findUnique({
    where: { id },
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
  return await prisma.item.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
};



export const ItemService = {
  createItem,
  getAllItems,
  getItemById,
  getItemBySlug,
  updateItem,
  deleteItem,
 
};
