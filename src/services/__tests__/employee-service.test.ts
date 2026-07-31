import prisma from '@/lib/db';
import { EmployeeService } from '../employee-service';

const mockPrisma = prisma as any;

describe('EmployeeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new employee', async () => {
      const mockEmployee = {
        id: 'emp-1',
        companyId: 'comp-1',
        fullName: 'John Doe',
        walletAddress: 'addr_test_123',
        email: 'john@example.com',
        designation: 'Engineer',
        department: 'Engineering',
        status: 'ACTIVE',
      };

      mockPrisma.employee.findUnique.mockResolvedValue(null);
      mockPrisma.employee.create.mockResolvedValue(mockEmployee);

      const result = await EmployeeService.create({
        companyId: 'comp-1',
        fullName: 'John Doe',
        walletAddress: 'addr_test_123',
        email: 'john@example.com',
        designation: 'Engineer',
        department: 'Engineering',
      });

      expect(result).toEqual(mockEmployee);
      expect(mockPrisma.employee.findUnique).toHaveBeenCalledWith({
        where: { walletAddress: 'addr_test_123' },
      });
      expect(mockPrisma.employee.create).toHaveBeenCalled();
    });

    it('should throw error for duplicate wallet address', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        EmployeeService.create({
          companyId: 'comp-1',
          fullName: 'John Doe',
          walletAddress: 'addr_test_123',
        })
      ).rejects.toThrow('Wallet address already registered');
    });
  });

  describe('getByCompanyId', () => {
    it('should return employees for a company', async () => {
      const mockEmployees = [
        { id: 'emp-1', fullName: 'John' },
        { id: 'emp-2', fullName: 'Jane' },
      ];

      mockPrisma.employee.findMany.mockResolvedValue(mockEmployees);

      const result = await EmployeeService.getByCompanyId('comp-1');

      expect(result).toEqual(mockEmployees);
      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith({
        where: {
          companyId: 'comp-1',
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should include archived employees when requested', async () => {
      mockPrisma.employee.findMany.mockResolvedValue([]);

      await EmployeeService.getByCompanyId('comp-1', true);

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith({
        where: {
          companyId: 'comp-1',
          deletedAt: undefined,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('update', () => {
    it('should update an employee', async () => {
      const mockUpdated = { id: 'emp-1', fullName: 'John Updated' };
      mockPrisma.employee.findFirst.mockResolvedValue(null);
      mockPrisma.employee.update.mockResolvedValue(mockUpdated);

      const result = await EmployeeService.update('emp-1', {
        fullName: 'John Updated',
      });

      expect(result).toEqual(mockUpdated);
    });

    it('should check for duplicate wallet on update', async () => {
      mockPrisma.employee.findFirst.mockResolvedValue({ id: 'other' });

      await expect(
        EmployeeService.update('emp-1', { walletAddress: 'addr_duplicate' })
      ).rejects.toThrow('Wallet address already registered');
    });
  });

  describe('archive', () => {
    it('should soft delete an employee', async () => {
      const mockArchived = { id: 'emp-1', status: 'ARCHIVED', deletedAt: new Date() };
      mockPrisma.employee.update.mockResolvedValue(mockArchived);

      const result = await EmployeeService.archive('emp-1');

      expect(result).toEqual(mockArchived);
      expect(mockPrisma.employee.update).toHaveBeenCalledWith({
        where: { id: 'emp-1' },
        data: {
          status: 'ARCHIVED',
          deletedAt: expect.any(Date),
        },
      });
    });
  });

  describe('getCount', () => {
    it('should return employee count', async () => {
      mockPrisma.employee.count.mockResolvedValue(5);

      const result = await EmployeeService.getCount('comp-1');

      expect(result).toBe(5);
      expect(mockPrisma.employee.count).toHaveBeenCalledWith({
        where: {
          companyId: 'comp-1',
          deletedAt: null,
          status: 'ACTIVE',
        },
      });
    });
  });
});
