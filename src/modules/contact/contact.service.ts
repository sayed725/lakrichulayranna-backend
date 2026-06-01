import { prisma } from '../../server';
import { TCreateContact } from './contact.interface';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { IQueryParams } from '../../interfaces/query.interface';
import { contactFilterableFields, contactSearchableFields } from './contact.constant';

const createContact = async (payload: TCreateContact) => {
  return await prisma.contact.create({
    data: payload,
  });
};

const getAllContacts = async (queries: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.contact, queries, {
    searchableFields: contactSearchableFields,
    filterableFields: contactFilterableFields,
  })
    .where({ isDeleted: false })
    .search()
    .filter()
    .sort()
    .paginate();

  const result = await queryBuilder.execute();
  return result;
};

const getContactById = async (id: string) => {
  return await prisma.contact.findUnique({
    where: { id, isDeleted: false },
  });
};

const markAsRead = async (id: string) => {
  return await prisma.contact.update({
    where: { id },
    data: { isRead: true },
  });
};

const deleteContact = async (id: string) => {
  return await prisma.contact.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
};

export const ContactService = {
  createContact,
  getAllContacts,
  getContactById,
  markAsRead,
  deleteContact,
};
