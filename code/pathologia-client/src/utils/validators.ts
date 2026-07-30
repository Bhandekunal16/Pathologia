import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const createUserSchema = z.object({
  fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'PATHOLOGIST', 'USER']),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  department: z.string().optional(),
  specialization: z.string().optional(),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  role: z.enum(['ADMIN', 'PATHOLOGIST', 'USER']),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  department: z.string().optional(),
  specialization: z.string().optional(),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

export const updateClinicalProfileSchema = updateProfileSchema.extend({
  department: z.string().optional(),
  specialization: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const inviteUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const acceptInviteSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const pathologyTestSchema = z.object({
  name: z.string().min(2, 'Test name must be at least 2 characters'),
  code: z.string().min(2, 'Test code must be at least 2 characters'),
  category: z.enum(['BLOOD', 'URINE', 'IMAGING', 'BODY_CHECKUP', 'OTHER']),
  specimenType: z.string().min(2, 'Specimen type is required'),
  description: z.string().optional(),
  manual: z.string().min(10, 'Manual must be at least 10 characters'),
  rate: z.coerce.number().min(0, 'Rate cannot be negative'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});
