import { Prisma } from "@prisma/client";

export const couponSearchableFields = ['code', 'title'];

export const couponFilterableFields = ['isActive', 'discountType', 'isDeleted'];

export const couponIncludeConfig = {};
