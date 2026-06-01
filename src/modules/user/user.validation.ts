import { z } from 'zod';

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
  }),
});

const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE', 'BANNED']),
  }),
});

export const UserValidation = {
  updateProfileSchema,
  changePasswordSchema,
  updateUserStatusSchema,
};
