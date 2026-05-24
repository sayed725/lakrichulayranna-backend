import { prisma } from '../../server';
import { TCreateContact } from './contact.interface';

const createContact = async (payload: TCreateContact) => {
  return await prisma.contact.create({
    data: payload,
  });
};

const getAllContacts = async () => {
  return await prisma.contact.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' },
  });
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
