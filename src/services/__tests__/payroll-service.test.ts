import prisma from '@/lib/db';
import { PayrollService } from '../payroll-service';

const mockPrisma = prisma as any;

describe('PayrollService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a payroll with items', async () => {
      const mockPayroll = {
        id: 'pay-1',
        companyId: 'comp-1',
        title: 'July Payroll',
        employeeCount: 2,
        status: 'DRAFT',
      };

      mockPrisma.employee.findMany.mockResolvedValue([
        { id: 'emp-1' },
        { id: 'emp-2' },
      ]);

      mockPrisma.payroll.create.mockResolvedValue(mockPayroll);
      mockPrisma.payrollItem.createMany.mockResolvedValue({ count: 2 });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await PayrollService.create({
        companyId: 'comp-1',
        title: 'July Payroll',
        payrollMonth: new Date('2026-07-01'),
        createdBy: 'addr_employer',
        employeeIds: ['emp-1', 'emp-2'],
      });

      expect(result).toEqual(mockPayroll);
      expect(mockPrisma.payrollItem.createMany).toHaveBeenCalled();
    });

    it('should throw error when no active employees', async () => {
      mockPrisma.employee.findMany.mockResolvedValue([]);

      await expect(
        PayrollService.create({
          companyId: 'comp-1',
          title: 'July Payroll',
          payrollMonth: new Date('2026-07-01'),
          createdBy: 'addr_employer',
          employeeIds: [],
        })
      ).rejects.toThrow('No active employees found');
    });
  });

  describe('getById', () => {
    it('should return payroll with items', async () => {
      const mockPayroll = {
        id: 'pay-1',
        title: 'July Payroll',
        items: [
          {
            id: 'item-1',
            employee: { id: 'emp-1', fullName: 'John' },
          },
        ],
      };

      mockPrisma.payroll.findUnique.mockResolvedValue(mockPayroll);

      const result = await PayrollService.getById('pay-1');

      expect(result).toEqual(mockPayroll);
    });

    it('should return null for non-existent payroll', async () => {
      mockPrisma.payroll.findUnique.mockResolvedValue(null);

      const result = await PayrollService.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('recordClaim', () => {
    it('should record a claim and update counts', async () => {
      const mockItem = { id: 'item-1', claimStatus: 'CLAIMED' };
      const mockPayroll = { id: 'pay-1', companyId: 'comp-1' };

      mockPrisma.payrollItem.update.mockResolvedValue(mockItem);
      mockPrisma.payroll.update
        .mockResolvedValueOnce({ id: 'pay-1', employeeCount: 5, claimedCount: 2 })
        .mockResolvedValueOnce({});
      mockPrisma.employee.update.mockResolvedValue({});
      mockPrisma.payroll.findUnique.mockResolvedValue(mockPayroll);
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await PayrollService.recordClaim('pay-1', 'emp-1');

      expect(result).toEqual(mockItem);
      expect(mockPrisma.payrollItem.update).toHaveBeenCalled();
      expect(mockPrisma.payroll.update).toHaveBeenCalledWith({
        where: { id: 'pay-1' },
        data: { claimedCount: { increment: 1 } },
        select: {
          id: true,
          employeeCount: true,
          claimedCount: true,
        },
      });
    });
  });

  describe('getProgress', () => {
    it('should return payroll progress', async () => {
      mockPrisma.payroll.findUnique.mockResolvedValue({
        employeeCount: 10,
        claimedCount: 5,
        status: 'READY',
      });

      const result = await PayrollService.getProgress('pay-1');

      expect(result).toEqual({
        total: 10,
        claimed: 5,
        percentage: 50,
        isComplete: false,
        status: 'READY',
      });
    });

    it('should return null for non-existent payroll', async () => {
      mockPrisma.payroll.findUnique.mockResolvedValue(null);

      const result = await PayrollService.getProgress('non-existent');

      expect(result).toBeNull();
    });
  });
});
