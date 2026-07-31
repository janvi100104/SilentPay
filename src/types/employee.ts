import { z } from 'zod';

export const createEmployeeSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  fullName: z.string().min(1, 'Name is required').max(120, 'Name too long'),
  walletAddress: z.string().min(1, 'Wallet address is required').max(120, 'Wallet address too long'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  designation: z.string().max(100, 'Designation too long').optional().or(z.literal('')),
  department: z.string().max(80, 'Department too long').optional().or(z.literal('')),
  joinedAt: z.string().optional().or(z.literal('')),
});

export const updateEmployeeSchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(120, 'Name too long').optional(),
  walletAddress: z.string().min(1, 'Wallet address is required').max(120, 'Wallet address too long').optional(),
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
