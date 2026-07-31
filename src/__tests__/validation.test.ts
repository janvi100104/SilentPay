import { createEmployeeSchema, updateEmployeeSchema } from '@/types/employee';
import { createPayrollSchema } from '@/types/payroll';
import { claimPaymentSchema } from '@/types/claim';

describe('Validation Schemas', () => {
  describe('Employee Validation', () => {
    describe('createEmployeeSchema', () => {
      it('should validate valid employee data', () => {
        const validData = {
          companyId: '00000000-0000-0000-0000-000000000001',
          fullName: 'John Doe',
          walletAddress: 'addr_test_123',
          email: 'john@example.com',
          designation: 'Engineer',
          department: 'Engineering',
        };

        const result = createEmployeeSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject empty name', () => {
        const invalidData = {
          companyId: '00000000-0000-0000-0000-000000000001',
          fullName: '',
          walletAddress: 'addr_test_123',
        };

        const result = createEmployeeSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject invalid UUID for companyId', () => {
        const invalidData = {
          companyId: 'not-a-uuid',
          fullName: 'John Doe',
          walletAddress: 'addr_test_123',
        };

        const result = createEmployeeSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should accept optional fields as empty strings', () => {
        const validData = {
          companyId: '00000000-0000-0000-0000-000000000001',
          fullName: 'John Doe',
          walletAddress: 'addr_test_123',
          email: '',
          designation: '',
          department: '',
        };

        const result = createEmployeeSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    describe('updateEmployeeSchema', () => {
      it('should allow partial updates', () => {
        const partialData = {
          fullName: 'John Updated',
        };

        const result = updateEmployeeSchema.safeParse(partialData);
        expect(result.success).toBe(true);
      });

      it('should validate status enum', () => {
        const invalidStatus = {
          status: 'INVALID_STATUS',
        };

        const result = updateEmployeeSchema.safeParse(invalidStatus);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Payroll Validation', () => {
    describe('createPayrollSchema', () => {
      it('should validate valid payroll data', () => {
        const validData = {
          companyId: '00000000-0000-0000-0000-000000000001',
          title: 'July Payroll',
          payrollMonth: '2026-07',
          createdBy: 'addr_employer',
          employeeIds: [
            '00000000-0000-0000-0000-000000000002',
            '00000000-0000-0000-0000-000000000003',
          ],
        };

        const result = createPayrollSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject empty employeeIds', () => {
        const invalidData = {
          companyId: '00000000-0000-0000-0000-000000000001',
          title: 'July Payroll',
          payrollMonth: '2026-07',
          createdBy: 'addr_employer',
          employeeIds: [],
        };

        const result = createPayrollSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject empty title', () => {
        const invalidData = {
          companyId: '00000000-0000-0000-0000-000000000001',
          title: '',
          payrollMonth: '2026-07',
          createdBy: 'addr_employer',
          employeeIds: ['00000000-0000-0000-0000-000000000002'],
        };

        const result = createPayrollSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Claim Validation', () => {
    describe('claimPaymentSchema', () => {
      it('should validate valid claim data', () => {
        const validData = {
          walletAddress: 'addr_test_123',
          payrollId: '00000000-0000-0000-0000-000000000001',
        };

        const result = claimPaymentSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject empty wallet address', () => {
        const invalidData = {
          walletAddress: '',
          payrollId: '00000000-0000-0000-0000-000000000001',
        };

        const result = claimPaymentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject invalid payroll UUID', () => {
        const invalidData = {
          walletAddress: 'addr_test_123',
          payrollId: 'not-a-uuid',
        };

        const result = claimPaymentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });
});
