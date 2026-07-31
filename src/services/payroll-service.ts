import prisma from '../lib/db';
import { PayrollStatus, ClaimStatus } from '@prisma/client';

export interface CreatePayrollInput {
  companyId: string;
  title: string;
  payrollMonth: Date;
  createdBy: string;
  employeeIds: string[];
}

export interface PayrollWithItems {
  id: string;
  title: string;
  payrollMonth: Date;
  status: PayrollStatus;
  employeeCount: number;
  claimedCount: number;
  contractAddress: string | null;
  createdAt: Date;
  items: Array<{
    id: string;
    employeeId: string;
    claimStatus: ClaimStatus;
    claimedAt: Date | null;
    employee: {
      id: string;
      fullName: string;
      walletAddress: string;
    };
  }>;
}

export class PayrollService {
  /**
   * Create a new payroll
   */
  static async create(input: CreatePayrollInput) {
    // Get active employees
    const employees = await prisma.employee.findMany({
      where: {
        companyId: input.companyId,
        id: { in: input.employeeIds },
        status: 'ACTIVE',
        deletedAt: null,
      },
    });

    if (employees.length === 0) {
      throw new Error('No active employees found');
    }

    // Create payroll with items in a transaction
    return prisma.$transaction(async (tx) => {
      const payroll = await tx.payroll.create({
        data: {
          companyId: input.companyId,
          title: input.title,
          payrollMonth: input.payrollMonth,
          createdBy: input.createdBy,
          employeeCount: employees.length,
          status: PayrollStatus.DRAFT,
        },
      });

      // Create payroll items for each employee
      await tx.payrollItem.createMany({
        data: employees.map((emp) => ({
          payrollId: payroll.id,
          employeeId: emp.id,
          claimStatus: ClaimStatus.NOT_CLAIMED,
        })),
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          companyId: input.companyId,
          actorWallet: input.createdBy,
          action: 'PAYROLL_CREATED',
          entity: 'Payroll',
          entityId: payroll.id,
          metadata: {
            title: input.title,
            employeeCount: employees.length,
          },
        },
      });

      return payroll;
    });
  }

  /**
   * Get payroll with items by ID
   */
  static async getById(id: string): Promise<PayrollWithItems | null> {
    return prisma.payroll.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            employee: {
              select: {
                id: true,
                fullName: true,
                walletAddress: true,
              },
            },
          },
        },
      },
    }) as Promise<PayrollWithItems | null>;
  }

  /**
   * Get all payrolls for a company
   */
  static async getByCompanyId(companyId: string) {
    return prisma.payroll.findMany({
      where: { companyId },
      include: {
        items: {
          select: {
            claimStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get payrolls for an employee (by wallet address)
   */
  static async getByEmployeeWallet(walletAddress: string) {
    const employee = await prisma.employee.findUnique({
      where: { walletAddress },
    });

    if (!employee) {
      return [];
    }

    return prisma.payrollItem.findMany({
      where: { employeeId: employee.id },
      include: {
        payroll: {
          select: {
            id: true,
            title: true,
            payrollMonth: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update payroll status
   */
  static async updateStatus(id: string, status: PayrollStatus, contractAddress?: string) {
    return prisma.payroll.update({
      where: { id },
      data: {
        status,
        ...(contractAddress && { contractAddress }),
      },
    });
  }

  /**
   * Record a claim
   */
  static async recordClaim(payrollId: string, employeeId: string, midnightReference?: string) {
    return prisma.$transaction(async (tx) => {
      // Update payroll item
      const item = await tx.payrollItem.update({
        where: {
          payrollId_employeeId: {
            payrollId,
            employeeId,
          },
        },
        data: {
          claimStatus: ClaimStatus.CLAIMED,
          claimedAt: new Date(),
          midnightReference,
          proofVerified: true,
        },
      });

      // Increment claimed count on payroll
      await tx.payroll.update({
        where: { id: payrollId },
        data: {
          claimedCount: {
            increment: 1,
          },
        },
      });

      // Update employee's last claim time
      await tx.employee.update({
        where: { id: employeeId },
        data: {
          lastClaimAt: new Date(),
        },
      });

      // Create audit log
      const payroll = await tx.payroll.findUnique({ where: { id: payrollId } });
      if (payroll) {
        await tx.auditLog.create({
          data: {
            companyId: payroll.companyId,
            actorWallet: '', // Will be set by caller
            action: 'CLAIM_COMPLETED',
            entity: 'PayrollItem',
            entityId: item.id,
            metadata: {
              payrollId,
              employeeId,
            },
          },
        });
      }

      return item;
    });
  }

  /**
   * Check if employee has already claimed
   */
  static async hasClaimed(payrollId: string, employeeId: string) {
    const item = await prisma.payrollItem.findUnique({
      where: {
        payrollId_employeeId: {
          payrollId,
          employeeId,
        },
      },
    });

    return item?.claimStatus === ClaimStatus.CLAIMED;
  }

  /**
   * Get payroll progress
   */
  static async getProgress(payrollId: string) {
    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      select: {
        employeeCount: true,
        claimedCount: true,
        status: true,
      },
    });

    if (!payroll) {
      return null;
    }

    return {
      total: payroll.employeeCount,
      claimed: payroll.claimedCount,
      percentage: payroll.employeeCount > 0
        ? Math.round((payroll.claimedCount / payroll.employeeCount) * 100)
        : 0,
      isComplete: payroll.claimedCount >= payroll.employeeCount,
      status: payroll.status,
    };
  }
}
