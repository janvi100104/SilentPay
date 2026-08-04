import { z } from 'zod';
import { isValidWalletAddress } from '@/lib/wallet-validation';

export const claimPaymentSchema = z.object({
  walletAddress: z
    .string()
    .min(1, 'Wallet address is required')
    .refine((val) => isValidWalletAddress(val), {
      message: 'Invalid Midnight wallet address — must start with mn_',
    }),
  payrollId: z.string().uuid('Invalid payroll ID'),
});

export type ClaimPaymentInput = z.infer<typeof claimPaymentSchema>;

export type ClaimStatus = 'NOT_CLAIMED' | 'CLAIMED' | 'EXPIRED';

export interface Claim {
  id: string;
  payrollId: string;
  employeeId: string;
  claimStatus: ClaimStatus;
  claimedAt: Date | null;
  midnightReference: string | null;
  proofVerified: boolean;
  payroll: {
    id: string;
    title: string;
    payrollMonth: Date;
    status: string;
  };
  employee: {
    id: string;
    fullName: string;
    walletAddress: string;
  };
}

export interface ClaimResponse {
  success: boolean;
  message: string;
  claim: {
    id: string;
    claimedAt: Date | null;
    proofVerified: boolean;
  };
}
