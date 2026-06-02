import { Prisma } from "../../generated/client";

export const bannerSearchableFields = ['title', 'subtitle', 'badge'];

export const bannerFilterableFields = ['isActive', 'banner', 'isDeleted', 'categoryId'];

export const bannerIncludeConfig: Prisma.BannerInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
};
