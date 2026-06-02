import { prisma } from '../../server';
import AppError from '../../errors/AppError';
import { TCreateBanner, TUpdateBanner } from './banner.interface';
import { IQueryParams } from '../../interfaces/query.interface';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { bannerSearchableFields, bannerFilterableFields, bannerIncludeConfig } from './banner.constant';

const createBanner = async (payload: TCreateBanner) => {
  return await prisma.banner.create({ data: payload });
};

const getAllBanners = async (queries: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.banner, queries, {
    searchableFields: bannerSearchableFields,
    filterableFields: bannerFilterableFields,
  })
    .where({ isDeleted: false })
    .search()
    .filter()
    .sort()
    .paginate()
    .include(bannerIncludeConfig);

  const result = await queryBuilder.execute();
  return result;
};

const updateBanner = async (id: string, payload: TUpdateBanner) => {
  return await prisma.banner.update({
    where: { id },
    data: payload,
  });
};

const deleteBanner = async (id: string) => {
  return await prisma.banner.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
};

export const BannerService = {
  createBanner,
  getAllBanners,
  updateBanner,
  deleteBanner,
};
