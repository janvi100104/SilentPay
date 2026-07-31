import prisma from '@/lib/db';
import { PayrollService } from '../payroll-service';
import { EmployeeService } from '../employee-service';

const mockPrisma = prisma as any;

describe('Claim Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Double Claim Prevention', () => {
    it('should prevent duplicate claims', async () => {
      // Setup: Employee exists, payroll is ready, already claimed
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        walletAddress: 'addr_test',
        status: 'ACTIVE',
      });

      mockPrisma.payroll.findUnique.mockResolvedValue({
        id: 'pay-1',
        status: 'READY',
        items: [
          {
            id: 'item-1',
            employeeId: 'emp-1',
            claimStatus: 'CLAIMED',
            claimedAt: new Date(),
          },
        ],
      });

      // Check if already claimed
      const employee = await EmployeeService.getByWalletAddress('addr_test');
      const payroll = await PayrollService.getById('pay-1');

      const payrollItem = payroll?.items?.find(
        (item) => item.employeeId === employee?.id
      );

      expect(payrollItem?.claimStatus).toBe('CLAIMED');
    });

    it('should allow claim for eligible employee', async () => {
      const mockItem = { id: 'item-1', claimStatus: 'CLAIMED' };

      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        walletAddress: 'addr_test',
        status: 'ACTIVE',
      });

      mockPrisma.payroll.findUnique.mockResolvedValue({
        id: 'pay-1',
        status: 'READY',
        items: [
          {
            id: 'item-1',
            employeeId: 'emp-1',
            claimStatus: 'NOT_CLAIMED',
          },
        ],
      });

      mockPrisma.payrollItem.update.mockResolvedValue(mockItem);
      mockPrisma.payroll.update.mockResolvedValue({});
      mockPrisma.employee.update.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const employee = await EmployeeService.getByWalletAddress('addr_test');
      const payroll = await PayrollService.getById('pay-1');

      const payrollItem = payroll?.items?.find(
        (item) => item.employeeId === employee?.id
      );

      expect(payrollItem?.claimStatus).toBe('NOT_CLAIMED');

      // Record claim
      const result = await PayrollService.recordClaim('pay-1', 'emp-1');
      expect(result.claimStatus).toBe('CLAIMED');
    });

    it('should reject claim for non-existent employee', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);

      const employee = await EmployeeService.getByWalletAddress('addr_nonexistent');
      expect(employee).toBeNull();
    });

    it('should reject claim for employee not in payroll', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 'emp-1',
        walletAddress: 'addr_test',
        status: 'ACTIVE',
      });

      mockPrisma.payroll.findUnique.mockResolvedValue({
        id: 'pay-1',
        status: 'READY',
        items: [
          {
            id: 'item-1',
            employeeId: 'emp-999', // Different employee
            claimStatus: 'NOT_CLAIMED',
          },
        ],
      });

      const employee = await EmployeeService.getByWalletAddress('addr_test');
      const payroll = await PayrollService.getById('pay-1');

      const payrollItem = payroll?.items?.find(
        (item) => item.employeeId === employee?.id
      );

      expect(payrollItem).toBeUndefined();
    });

    it('should reject claim for non-ready payroll', async () => {
      mockPrisma.payroll.findUnique.mockResolvedValue({
        id: 'pay-1',
        status: 'DRAFT', // Not ready
        items: [],
      });

      const payroll = await PayrollService.getById('pay-1');
      expect(payroll?.status).not.toBe('READY');
    });
  });

  describe('Claim Progress', () => {
    it('should track claim progress correctly', async () => {
      mockPrisma.payroll.findUnique.mockResolvedValue({
        employeeCount: 5,
        claimedCount: 3,
        status: 'READY',
      });

      const progress = await PayrollService.getProgress('pay-1');

      expect(progress).toEqual({
        total: 5,
        claimed: 3,
        percentage: 60,
        isComplete: false,
        status: 'READY',
      });
    });

    it('should mark payroll as complete when all claimed', async () => {
      mockPrisma.payroll.findUnique.mockResolvedValue({
        employeeCount: 5,
        claimedCount: 5,
        status: 'READY',
      });

      const progress = await PayrollService.getProgress('pay-1');

      expect(progress?.isComplete).toBe(true);
    });
  });
});
