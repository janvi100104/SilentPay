import prisma from '../lib/db';
import { Prisma, EmployeeStatus } from '@prisma/client';

export interface CreateEmployeeInput {
  companyId: string;
  fullName: string;
  walletAddress: string;
  email?: string;
  designation?: string;
  department?: string;
  joinedAt?: Date;
}

export interface UpdateEmployeeInput {
  fullName?: string;
  walletAddress?: string;
  email?: string;
  designation?: string;
  department?: string;
  status?: EmployeeStatus;
}

export class EmployeeService {
  /**
   * Create a new employee
   */
  static async create(input: CreateEmployeeInput) {
    // Check for duplicate wallet address
    const existing = await prisma.employee.findUnique({
      where: { walletAddress: input.walletAddress },
    });

    if (existing) {
      throw new Error('Wallet address already registered');
    }

    return prisma.employee.create({
      data: input,
    });
  }

  /**
   * Get all employees for a company
   */
  static async getByCompanyId(companyId: string, includeArchived = false) {
    return prisma.employee.findMany({
      where: {
        companyId,
        deletedAt: includeArchived ? undefined : null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get an employee by ID
   */
  static async getById(id: string) {
    return prisma.employee.findUnique({
      where: { id },
    });
  }

  /**
   * Get employee by wallet address (case-insensitive, trimmed)
   */
  static async getByWalletAddress(walletAddress: string) {
    const trimmed = walletAddress.trim().toLowerCase();
    const employee = await prisma.employee.findFirst({
      where: {
        walletAddress: { equals: trimmed, mode: 'insensitive' },
      },
    });
    return employee;
  }

  /**
   * Update an employee
   */
  static async update(id: string, input: UpdateEmployeeInput) {
    // If updating wallet address, check for duplicates
    if (input.walletAddress) {
      const existing = await prisma.employee.findFirst({
        where: {
          walletAddress: input.walletAddress,
          id: { not: id },
        },
      });

      if (existing) {
        throw new Error('Wallet address already registered');
      }
    }

    return prisma.employee.update({
      where: { id },
      data: input,
    });
  }

  /**
   * Soft delete (archive) an employee
   */
  static async archive(id: string) {
    return prisma.employee.update({
      where: { id },
      data: {
        status: EmployeeStatus.ARCHIVED,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Get employee count for a company
   */
  static async getCount(companyId: string) {
    return prisma.employee.count({
      where: {
        companyId,
        deletedAt: null,
        status: EmployeeStatus.ACTIVE,
      },
    });
  }
}
