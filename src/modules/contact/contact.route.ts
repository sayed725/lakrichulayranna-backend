import express from 'express';
import { ContactController } from './contact.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ContactValidation } from './contact.validation';
import auth from '../../middlewares/auth';
import admin from '../../middlewares/admin';
import { contactLimiter, adminLimiter } from '../../middlewares/rateLimiter';

const router = express.Router();

// Public route - anyone can submit contact form
router.post('/', contactLimiter, validateRequest(ContactValidation.createContactValidationSchema), ContactController.createContact);

// Admin routes - require authentication and admin role
router.get('/', auth, admin, adminLimiter, ContactController.getAllContacts);
router.get('/:id', auth, admin, adminLimiter, ContactController.getContactById);
router.patch('/:id/mark-read', auth, admin, adminLimiter, ContactController.markAsRead);
router.delete('/:id', auth, admin, adminLimiter, ContactController.deleteContact);

export const ContactRoutes = router;
