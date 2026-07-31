import { z } from 'zod';

export const createPayrollSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  title: z.string().min(1, 'Title is required').max(120, 'Title too long'),
  payrollMonth: z.string().min(1, 'Payroll month is required'),
  createdBy: z.string().min(1, 'Creator wallet is required'),
  employeeIds: z.array(z.string().uuid()).min(1, 'Select at least one employee'),
});

export type CreatePayrollInput = z.infer<typeof createPayrollSchema>;

export type PayrollStatus = 'DRAFT' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface PayrollItem {
  id: string;
  payrollId: string;
  employeeId: string;
  claimStatus: 'NOT_CLAIMED' | 'CLAIMED' | 'EXPIRED';
  claimedAt: Date | null;
  midnightReference: string | null;
  proofVerified: boolean;
  employee: {
    id: string;
    fullName: string;
    walletAddress: string;
  };
}

export interface Payroll {
  id: string;
  companyId: string;
  title: string;
  payrollMonth: Date;
  employeeCount: number;
  claimedCount: number;
  status: PayrollStatus;
  contractAddress: string | null;
  transactionHash: string | null;
  proofReference: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  items?: PayrollItem[];
}

export interface PayrollProgress {
  total: number;
  claimed: number;
  percentage: number;
  isComplete: boolean;
  status: PayrollStatus;
}
