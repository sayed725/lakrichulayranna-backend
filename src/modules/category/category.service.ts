import { prisma } from '../../server';
import AppError from '../../errors/AppError';
import { TCreateCategory, TUpdateCategory } from './category.interface';
import { generateSlug } from '../../utils/generateSlug';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { IQueryParams } from '../../interfaces/query.interface';
import { categoryFilterableFields, categoryIncludeConfig, categorySearchableFields } from './category.constant';

const createCategory = async (payload: TCreateCategory) => {
  let slug = generateSlug(payload.name);
  
  // Ensure unique slug
  let isExist = await prisma.category.findUnique({ where: { slug } });
  let counter = 1;
  while (isExist) {
    slug = `${generateSlug(payload.name)}-${counter}`;
    isExist = await prisma.category.findUnique({ where: { slug } });
    counter++;
  }

  return await prisma.category.create({
    data: {
      ...payload,
      slug,
    },
  });
};

const getCategories = async (queries: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.category, queries, {
    searchableFields: categorySearchableFields,
    filterableFields: categoryFilterableFields,
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .include(categoryIncludeConfig);

  const result = await queryBuilder.execute();
  return result;
};

const getCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      items: {
        where: { isAvailable: true },
      },
    },
  });

  if (!category) throw new AppError(404, 'Category not found');
  return category;
};

const updateCategory = async (id: string, payload: TUpdateCategory) => {
  return await prisma.category.update({
    where: { id },
    data: payload,
  });
};

const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!category) throw new AppError(404, 'Category not found');
  if (category.items.length > 0) {
    throw new AppError(400, 'Cannot delete category that has items');
  }

  return await prisma.category.delete({ where: { id } });
};

const getHomeCategories = async (queries: IQueryParams) => {
  const includeItems = queries.includeItems === 'true';
  const itemsLimit = Number(queries.itemsLimit) || 10;
  
  const includeConfig = includeItems
    ? {
        items: {
          where: { isAvailable: true, isCategoryFeatured: true },
          take: itemsLimit,
        },
      }
    : categoryIncludeConfig;

  const queryBuilder = new QueryBuilder(prisma.category, queries, {
    searchableFields: categorySearchableFields,
    filterableFields: categoryFilterableFields,
  })
    .where({ isFeatured: true })
    .search()
    .filter()
    .sort()
    .paginate()
    .include(includeConfig);

  const result = await queryBuilder.execute();
  return result;
};

export const CategoryService = {
  createCategory,
  getCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  getHomeCategories,
};
