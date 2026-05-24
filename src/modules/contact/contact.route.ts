import express from 'express';
import { ContactController } from './contact.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ContactValidation } from './contact.validation';
import auth from '../../middlewares/auth';
import admin from '../../middlewares/admin';

const router = express.Router();

// Public route - anyone can submit contact form
router.post('/', validateRequest(ContactValidation.createContactValidationSchema), ContactController.createContact);

// Admin routes - require authentication and admin role
router.get('/', auth, admin, ContactController.getAllContacts);
router.get('/:id', auth, admin, ContactController.getContactById);
router.patch('/:id/mark-read', auth, admin, ContactController.markAsRead);
router.delete('/:id', auth, admin, ContactController.deleteContact);

export const ContactRoutes = router;
