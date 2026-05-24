import { z } from 'zod';

const createContactValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    subject: z.string().min(1, 'Subject is required'),
    message: z.string().min(1, 'Message is required'),
    phone: z.string().optional(),
  }),
});

export const ContactValidation = {
  createContactValidationSchema,
};
