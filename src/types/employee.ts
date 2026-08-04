import { z } from 'zod';
import { isValidWalletAddress } from '@/lib/wallet-validation';

const walletAddressField = z
  .string()
  .min(1, 'Wallet address is required')
  .max(150, 'Wallet address too long')
  .refine((val) => isValidWalletAddress(val), {
    message: 'Invalid Midnight wallet address — must start with mn_',
  });

export const createEmployeeSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  fullName: z.string().min(1, 'Name is required').max(120, 'Name too long'),
  walletAddress: walletAddressField,
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  designation: z.string().max(100, 'Designation too long').optional().or(z.literal('')),
  department: z.string().max(80, 'Department too long').optional().or(z.literal('')),
  joinedAt: z.string().optional().or(z.literal('')),
});

export const updateEmployeeSchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(120, 'Name too long').optional(),
  walletAddress: walletAddressField.optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  designation: z.string().max(100, 'Designation too long').optional().or(z.literal('')),
  department: z.string().max(80, 'Department too long').optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export interface Employee {
  id: string;
  companyId: string;
  fullName: string;
  walletAddress: string;
  email: string | null;
  designation: string | null;
  department: string | null;
  joinedAt: Date | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  avatarUrl: string | null;
  notes: string | null;
  lastClaimAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
