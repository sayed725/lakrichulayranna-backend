import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ContactService } from './contact.service';
import { ContactValidation } from './contact.validation';

const createContact = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.createContact(req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Contact form submitted successfully', data: result });
});

const getAllContacts = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.getAllContacts();
  sendResponse(res, { statusCode: 200, success: true, message: 'All contacts retrieved', data: result });
});

const getContactById = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.getContactById(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Contact retrieved', data: result });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.markAsRead(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Contact marked as read', data: result });
});

const deleteContact = catchAsync(async (req: Request, res: Response) => {
  await ContactService.deleteContact(req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Contact deleted', data: null });
});

export const ContactController = {
  createContact,
  getAllContacts,
  getContactById,
  markAsRead,
  deleteContact,
};
